"""
THE RED — news Manchester United via onefootball-wrapper.
MU OneFootball team_id = 21 (search_teams('Manchester United')).
"""
from __future__ import annotations

import asyncio
import re
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from onefootball import OneFootball

MU_TEAM_ID = 21
MU_TEAM_NAME = "Manchester United"

Category = Literal["all", "officiel", "matchs", "mercato", "club", "medias"]

app = FastAPI(title="THE RED OneFootball News", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache: dict[str, Any] = {"at": 0.0, "items": []}
CACHE_TTL = 120.0


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def categorize(title: str, body: str = "") -> str:
    # Title weighted first for more stable filters
    head = title.lower()
    t = f"{title} {body[:280]}".lower()
    if any(
        k in head
        for k in (
            "transfer",
            "signing",
            "signed",
            "loan",
            "bid for",
            "set to join",
            "close to",
            "target",
            "pursuit",
            "recrue",
            "mercato",
            "takeover",
            "prêt",
            "signature",
            "arrivée",
            "départ",
            "cible",
            "piste",
        )
    ) or any(k in t for k in ("transfer window", "new signing", "loan deal", "contract extension", "fenêtre des transferts")):
        return "mercato"
    if any(
        k in head
        for k in (
            "how to watch",
            "team news",
            "line-up",
            "lineup",
            "preview",
            "match report",
            "vs ",
            " v ",
            "comeback",
            "win over",
            "defeat",
            "composition",
            "avant-match",
            "après-match",
            "compte-rendu",
            "comment suivre",
            "victoire",
            "défaite",
        )
    ) or any(k in t for k in ("final whistle", "full-time", "kick-off", "champions league clash", "coup d'envoi")):
        return "matchs"
    if any(
        k in head
        for k in (
            "press conference",
            "interview",
            "gallery",
            "video:",
            "exclusive",
            "conférence de presse",
            "galerie",
            "vidéo",
            "exclusif",
        )
    ):
        return "medias"
    if any(k in head for k in ("official", "statement", "confirm", "announces", "mufc", "officiel", "communiqué", "annonce")):
        return "officiel"
    if any(
        k in head or k in t
        for k in (
            "tribute",
            "ownership",
            "glazer",
            "ratcliffe",
            "supporter",
            "community",
            "academy",
            "hommage",
            "communauté",
            "académie",
            "old trafford dinner",
        )
    ):
        return "club"
    return "club"


def _image_from(item: dict[str, Any]) -> str | None:
    images = item.get("images") or {}
    if isinstance(images, dict):
        for key in ("large", "thumb", "share"):
            url = images.get(key)
            if isinstance(url, str) and url.startswith("http"):
                return url
    media = item.get("media")
    if isinstance(media, list) and media:
        m0 = media[0] if isinstance(media[0], dict) else {}
        imgs = (m0.get("images") or {}) if isinstance(m0, dict) else {}
        large = imgs.get("large") if isinstance(imgs, dict) else None
        if isinstance(large, dict) and large.get("link"):
            return str(large["link"])
        thumb = imgs.get("thumb") if isinstance(imgs, dict) else None
        if isinstance(thumb, dict) and thumb.get("link"):
            return str(thumb["link"])
    for key in ("image_url", "imageUrl", "thumbnail"):
        url = item.get(key)
        if isinstance(url, str) and url.startswith("http"):
            return url
    return None


def _normalize_article(raw: dict[str, Any]) -> dict[str, Any] | None:
    title = (raw.get("title") or raw.get("headline") or "").strip()
    if not title:
        return None
    body = (raw.get("content") or raw.get("teaser") or raw.get("summary") or "").strip()
    # strip html-ish leftovers
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"\s+", " ", body).strip()
    aid = str(raw.get("id") or raw.get("object_id") or title[:40])
    published = (
        raw.get("publish_time")
        or raw.get("date")
        or raw.get("published_at")
        or _now_iso()
    )
    url = (
        raw.get("content_url")
        or raw.get("share_link")
        or raw.get("url")
        or raw.get("link")
        or raw.get("item_link")
    )
    category = categorize(title, body)
    return {
        "id": aid,
        "title": title,
        "summary": body[:320] + ("…" if len(body) > 320 else ""),
        "body": body,
        "category": category,
        "source": "OneFootball",
        "published_at": published,
        "url": url,
        "image_url": _image_from(raw),
        "verified": bool(raw.get("verified") or raw.get("only_verified")),
    }


async def _fetch_united_news() -> list[dict[str, Any]]:
    now = asyncio.get_event_loop().time()
    if _cache["items"] and now - float(_cache["at"]) < CACHE_TTL:
        return list(_cache["items"])

    merged: dict[str, dict[str, Any]] = {}

    def ingest(payload: Any, verified: bool = False) -> None:
        rows = payload
        if isinstance(payload, dict):
            rows = payload.get("news") or payload.get("items") or []
        if not isinstance(rows, list):
            return
        for row in rows:
            if not isinstance(row, dict):
                continue
            if row.get("content_type") in ("ad", "sticky_ad", "banner"):
                continue
            art = _normalize_article(row)
            if not art:
                continue
            if verified:
                art["verified"] = True
                if art["category"] == "club":
                    art["category"] = "officiel"
            prev = merged.get(art["id"])
            merged[art["id"]] = {**(prev or {}), **art} if prev else art

    async with OneFootball() as of:
        client = of._api
        paths = [
            ("news", f"/news/v2/fr/relevance/teams/{MU_TEAM_ID}/items?personalised=not_set&mediation=iPhone-premiumgeos-team_news", False),
            ("news", f"/news/v2/en/relevance/teams/{MU_TEAM_ID}/items?personalised=not_set&mediation=iPhone-premiumgeos-team_news", False),
            ("v6news", f"/v6/fr/teams/{MU_TEAM_ID}/items?only_verified=true", True),
            ("v6news", f"/v6/fr/teams/{MU_TEAM_ID}/items", False),
            ("v6news", f"/v6/en/teams/{MU_TEAM_ID}/items", False),
            ("search", f"/v2/fr/search?q={MU_TEAM_NAME}", False),
            ("search", "/v2/fr/search?q=Man%20United", False),
            ("search", "/v2/fr/search?q=Old%20Trafford", False),
            ("search", "/v2/en/search?q=Manchester%20United", False),
            ("v6news", "/v6/fr/competitions/9/items", False),
        ]
        for base, path, verified in paths:
            try:
                data = await client._request(base, path)
                ingest(data, verified=verified)
            except Exception:
                continue

    hints = (
        "manchester united",
        "man united",
        "man utd",
        "old trafford",
        "red devils",
        "mufc",
        "amorim",
        "carrick",
    )
    filtered = [
        item
        for item in merged.values()
        if item.get("verified")
        or any(h in f"{item.get('title','')} {item.get('summary','')}".lower() for h in hints)
    ]
    pool = filtered if len(filtered) >= 8 else list(merged.values())
    items = sorted(pool, key=lambda x: str(x.get("published_at") or ""), reverse=True)[:80]
    _cache["at"] = now
    _cache["items"] = items
    return items


@app.get("/health")
async def health():
    return {"ok": True, "service": "thered-onefootball", "teamId": MU_TEAM_ID}


@app.get("/news/united")
async def united_news(
    category: Category = Query("all"),
    q: str = Query(""),
    limit: int = Query(40, ge=1, le=80),
):
    items = await _fetch_united_news()
    if category != "all":
        items = [i for i in items if i.get("category") == category]
    if q.strip():
        needle = q.strip().lower()
        items = [
            i
            for i in items
            if needle in (i.get("title") or "").lower()
            or needle in (i.get("summary") or "").lower()
        ]
    return {
        "team": {"id": MU_TEAM_ID, "name": MU_TEAM_NAME},
        "fetched_at": _now_iso(),
        "count": len(items[:limit]),
        "items": items[:limit],
    }


@app.get("/news/united/{article_id}")
async def united_article(article_id: str):
    items = await _fetch_united_news()
    for item in items:
        if str(item.get("id")) == str(article_id):
            return item
    return {"error": "not_found", "id": article_id}
