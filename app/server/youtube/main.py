"""
THE RED — vidéos Manchester United via yt-dlp (chaîne officielle @manutd).
"""
from __future__ import annotations

import asyncio
import re
import time
from typing import Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

MU_CHANNEL = "https://www.youtube.com/@manutd"
MU_CHANNEL_ID = "UC6yW44UGJJBvYTlfC7CRg2Q"
MU_VIDEOS = f"{MU_CHANNEL}/videos"
MU_PLAYLISTS = f"{MU_CHANNEL}/playlists"
# Résumés de match officiels (1ère équipe) — saisons courante + précédente
MU_HIGHLIGHTS_PLAYLISTS = [
    "https://www.youtube.com/playlist?list=PLQ5VvmbadZas",  # 2026/27
    "https://www.youtube.com/playlist?list=PL5-QUghxmluLRUTCh-umhonToE-X_Dnu-",  # 2025/26
]
MU_HIGHLIGHTS_PLAYLIST = MU_HIGHLIGHTS_PLAYLISTS[0]

app = FastAPI(title="THE RED YouTube MU", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache: dict[str, Any] = {
    "videos_at": 0.0,
    "videos": [],
    "playlists_at": 0.0,
    "playlists": [],
    "highlights_at": 0.0,
    "highlights": [],
}
CACHE_TTL = 15 * 60


def _category(title: str) -> str:
    t = title.lower()
    if "inside carrington" in t or "podcast" in t:
        return "inside"
    # Résumé de match : Highlights, scoreline (3-2), goals…
    if (
        "highlight" in t
        or "extended highlight" in t
        or "goals" in t
        or "90 in 20" in t
        or re.search(r"\b\d+\s*[-–]\s*\d+\b", t)
        or re.search(r"\bvs\.?\b|\bv\b", t)
    ):
        return "highlights"
    if "training" in t or "train at" in t or "getting ready" in t:
        return "training"
    if "press conference" in t or "post-match" in t or "post match" in t:
        return "press"
    if "u18" in t or "u19" in t or "u21" in t or "academy" in t or "youth" in t:
        return "academy"
    if "collection" in t or "premier league collection" in t:
        return "collection"
    if "live" in t:
        return "live"
    return "latest"


def _video_id(raw: Any) -> str | None:
    if raw is None:
        return None
    vid = str(raw).strip()
    if "watch?v=" in vid:
        vid = vid.split("watch?v=")[-1].split("&")[0]
    if "/shorts/" in vid:
        vid = vid.split("/shorts/")[-1].split("?")[0]
    # IDs YouTube = 11 chars ; playlists = PL...
    if re.fullmatch(r"[\w-]{11}", vid):
        return vid
    return None


def _thumb_for_video(vid: str) -> str:
    return f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"


def _playlist_thumb(entry: dict[str, Any]) -> str | None:
    thumbs = entry.get("thumbnails") or []
    if isinstance(thumbs, list):
        for t in reversed(thumbs):
            if isinstance(t, dict) and t.get("url"):
                return str(t["url"])
    return None


def _map_video(entry: dict[str, Any]) -> dict[str, Any] | None:
    vid = _video_id(entry.get("id")) or _video_id(entry.get("url")) or _video_id(entry.get("webpage_url"))
    title = (entry.get("title") or "").strip()
    if not vid or not title or title == "[Private video]":
        return None
    duration = entry.get("duration")
    try:
        duration_s = int(duration) if duration is not None else None
    except (TypeError, ValueError):
        duration_s = None
    return {
        "id": vid,
        "title": title,
        "duration": duration_s,
        "views": entry.get("view_count"),
        "thumbnail": _thumb_for_video(vid),
        "url": f"https://www.youtube.com/watch?v={vid}",
        "category": _category(title),
        "published_at": entry.get("upload_date") or entry.get("release_timestamp"),
        "description": (entry.get("description") or "")[:240],
    }


def _run_ytdlp(url: str, playlist_end: int = 40) -> list[dict[str, Any]]:
    import yt_dlp

    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
        "playlistend": playlist_end,
        "ignoreerrors": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
    if not info:
        return []
    entries = info.get("entries") or []
    out: list[dict[str, Any]] = []
    for e in entries:
        if not isinstance(e, dict):
            continue
        mapped = _map_video(e)
        if mapped:
            out.append(mapped)
    return out


def _is_academy_title(title: str) -> bool:
    t = title.lower()
    return bool(re.search(r"\bu1[89]\b|\bu21\b|academy|youth league|youth\b", t))


def _run_match_summaries(per_playlist: int = 40) -> list[dict[str, Any]]:
    """Agrège les playlists Highlights 1ère équipe (dédupliquées)."""
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for url in MU_HIGHLIGHTS_PLAYLISTS:
        for v in _run_ytdlp(url, per_playlist):
            if v["id"] in seen:
                continue
            # Moments forts Home = résumés 1ère équipe (pas U18/U19/U21)
            if _is_academy_title(v["title"]):
                continue
            # Skip mega-compilations type "EVERY … Match Of"
            if re.search(r"^every\b", v["title"], re.I):
                continue
            seen.add(v["id"])
            v["category"] = "highlights"
            out.append(v)
    return out


def _run_playlists(playlist_end: int = 24) -> list[dict[str, Any]]:
    import yt_dlp

    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
        "playlistend": playlist_end,
        "ignoreerrors": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(MU_PLAYLISTS, download=False)
    if not info:
        return []
    out: list[dict[str, Any]] = []
    for e in info.get("entries") or []:
        if not isinstance(e, dict):
            continue
        pid = e.get("id")
        title = (e.get("title") or "").strip()
        if not pid or not title:
            continue
        out.append(
            {
                "id": str(pid),
                "title": title,
                "count": e.get("playlist_count") or e.get("n_entries"),
                "thumbnail": _playlist_thumb(e),
                "url": e.get("url") or f"https://www.youtube.com/playlist?list={pid}",
                "badge": "Nouveaux épisodes" if re.search(r"2026|2025|26/27|25/26", title) else None,
            }
        )
    return out


@app.get("/health")
async def health():
    return {"ok": True, "service": "thered-youtube", "channel": "@manutd", "channelId": MU_CHANNEL_ID}


@app.get("/videos/united")
async def united_videos(limit: int = Query(40, ge=1, le=80)):
    now = time.time()
    if _cache["videos"] and now - float(_cache["videos_at"]) < CACHE_TTL:
        items = _cache["videos"][:limit]
    else:
        items = await asyncio.to_thread(_run_ytdlp, MU_VIDEOS, limit)
        _cache["videos"] = items
        _cache["videos_at"] = now
        items = items[:limit]

    if _cache["highlights"] and now - float(_cache["highlights_at"]) < CACHE_TTL:
        match_summaries = _cache["highlights"]
    else:
        match_summaries = await asyncio.to_thread(_run_match_summaries, 40)
        _cache["highlights"] = match_summaries
        _cache["highlights_at"] = now

    by_cat: dict[str, list[dict[str, Any]]] = {}
    for v in items:
        by_cat.setdefault(v["category"], []).append(v)

    # Résumés playlist + highlights détectés sur la chaîne
    channel_hl = [
        v for v in by_cat.get("highlights", []) if not _is_academy_title(v["title"])
    ]
    seen_ids = {v["id"] for v in match_summaries}
    merged_hl = list(match_summaries)
    for v in channel_hl:
        if v["id"] not in seen_ids:
            seen_ids.add(v["id"])
            merged_hl.append(v)
    highlights = merged_hl[:40]

    return {
        "channel": {"id": MU_CHANNEL_ID, "handle": "@manutd", "name": "Manchester United"},
        "count": len(items),
        "items": items,
        "match_summaries": highlights,
        "sections": {
            "latest": items[:20],
            "highlights": highlights,
            "inside": by_cat.get("inside", [])[:16],
            "training": by_cat.get("training", [])[:16],
            "press": by_cat.get("press", [])[:12],
            "academy": by_cat.get("academy", [])[:12],
            "collection": by_cat.get("collection", [])[:12],
            "live": by_cat.get("live", [])[:8],
        },
        "featured": items[0] if items else None,
    }


@app.get("/videos/united/highlights")
async def united_match_summaries(limit: int = Query(40, ge=1, le=80)):
    now = time.time()
    if _cache["highlights"] and now - float(_cache["highlights_at"]) < CACHE_TTL:
        items = _cache["highlights"][:limit]
    else:
        items = await asyncio.to_thread(_run_match_summaries, 40)
        _cache["highlights"] = items
        _cache["highlights_at"] = now
        items = items[:limit]
    return {
        "count": len(items),
        "items": items,
        "playlists": MU_HIGHLIGHTS_PLAYLISTS,
    }


@app.get("/playlists/united")
async def united_playlists(limit: int = Query(20, ge=1, le=40)):
    now = time.time()
    if _cache["playlists"] and now - float(_cache["playlists_at"]) < CACHE_TTL:
        items = _cache["playlists"][:limit]
    else:
        items = await asyncio.to_thread(_run_playlists, limit)
        _cache["playlists"] = items
        _cache["playlists_at"] = now
        items = items[:limit]
    return {"count": len(items), "items": items}
