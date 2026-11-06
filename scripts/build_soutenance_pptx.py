#!/usr/bin/env python3
"""Génère le PowerPoint de soutenance THE RED."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import nsmap
from pptx.oxml import parse_xml
from pptx.util import Inches, Pt, Emu

# Brand THE RED
RED = RGBColor(0xDA, 0x29, 0x1C)
GOLD = RGBColor(0xFB, 0xE1, 0x22)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
OFF_WHITE = RGBColor(0xF1, 0xF5, 0xF9)
MUTED = RGBColor(0x94, 0xA3, 0xB8)
CARD = RGBColor(0x1A, 0x08, 0x0A)
DARK = RGBColor(0x05, 0x02, 0x03)
DARK2 = RGBColor(0x0C, 0x05, 0x07)
SOFT_RED = RGBColor(0x7F, 0x1D, 0x1D)

OUT = Path(__file__).resolve().parents[1] / "THE_RED_Soutenance.pptx"
W, H = Inches(13.333), Inches(7.5)  # 16:9 widescreen


def set_run(run, size=18, bold=False, color=WHITE, font="Calibri"):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font


def add_bg(slide, color=DARK):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    # send to back
    spTree = slide.shapes._spTree
    sp = shape._element
    spTree.remove(sp)
    spTree.insert(2, sp)
    return shape


def add_accent_bar(slide, top=0):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, top, W, Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RED
    bar.line.fill.background()


def add_gold_line(slide, left, top, width):
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = GOLD
    line.line.fill.background()


def add_footer(slide, page, total=16):
    box = slide.shapes.add_textbox(Inches(0.5), Inches(7.05), Inches(10), Inches(0.35))
    p = box.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = f"THE RED  ·  Holberton School  ·  Harold Nguemeta  ·  {page}/{total}"
    set_run(run, 11, False, MUTED)
    # page badge
    badge = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(12.2), Inches(7.0), Inches(0.7), Inches(0.35)
    )
    badge.fill.solid()
    badge.fill.fore_color.rgb = RED
    badge.line.fill.background()
    tf = badge.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run()
    r.text = str(page)
    set_run(r, 11, True, WHITE)


def add_title(slide, text, left=Inches(0.6), top=Inches(0.35), width=Inches(12), size=32):
    box = slide.shapes.add_textbox(left, top, width, Inches(0.7))
    p = box.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = text
    set_run(run, size, True, WHITE, "Georgia")
    return box


def add_subtitle(slide, text, left=Inches(0.6), top=Inches(0.95), width=Inches(12), size=16):
    box = slide.shapes.add_textbox(left, top, width, Inches(0.4))
    p = box.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = text
    set_run(run, size, False, MUTED)
    return box


def add_card(slide, left, top, width, height, fill=CARD):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = RGBColor(0x3F, 0x0A, 0x0A)
    shape.line.width = Pt(1)
    return shape


def add_text_in_shape(shape, text, size=14, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    tf = shape.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].alignment = align
    # clear
    tf.clear()
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    set_run(run, size, bold, color)


def bullet_box(slide, left, top, width, height, lines, size=15):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.level = 0
        p.space_after = Pt(8)
        run = p.add_run()
        run.text = f"▸  {line}"
        set_run(run, size, False, OFF_WHITE)
    return box


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def new_slide(prs):
    blank = prs.slide_layouts[6]  # blank
    slide = prs.slides.add_slide(blank)
    add_bg(slide)
    add_accent_bar(slide)
    return slide


def build():
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    total = 16

    # ── 1. COVER ──────────────────────────────────────────────
    s = new_slide(prs)
    # big red panel left
    panel = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(5.2), H)
    panel.fill.solid()
    panel.fill.fore_color.rgb = RED
    panel.line.fill.background()
    # gold stripe
    g = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.2), 0, Inches(0.12), H)
    g.fill.solid()
    g.fill.fore_color.rgb = GOLD
    g.line.fill.background()

    t = s.shapes.add_textbox(Inches(0.5), Inches(2.0), Inches(4.4), Inches(1.2))
    p = t.text_frame.paragraphs[0]
    r = p.add_run()
    r.text = "THE RED"
    set_run(r, 54, True, WHITE, "Georgia")

    t2 = s.shapes.add_textbox(Inches(0.5), Inches(3.2), Inches(4.4), Inches(1.2))
    p = t2.text_frame.paragraphs[0]
    r = p.add_run()
    r.text = "Manchester United\nFan Application"
    set_run(r, 22, False, OFF_WHITE)

    t3 = s.shapes.add_textbox(Inches(0.5), Inches(5.8), Inches(4.4), Inches(0.8))
    p = t3.text_frame.paragraphs[0]
    r = p.add_run()
    r.text = "Soutenance technique  ·  MVP\nHolberton School — Trimestre 3"
    set_run(r, 14, False, OFF_WHITE)

    right = s.shapes.add_textbox(Inches(6.0), Inches(2.4), Inches(6.5), Inches(3))
    tf = right.text_frame
    tf.word_wrap = True
    lines = [
        ("Harold Nguemeta", 28, True, WHITE),
        ("Ingénierie logicielle", 16, False, MUTED),
        ("", 12, False, MUTED),
        ("Match Center  ·  News  ·  Community", 16, False, GOLD),
        ("Live  ·  Programme  ·  Mon XI  ·  Vidéos", 15, False, OFF_WHITE),
        ("", 12, False, MUTED),
        ("github.com/haroldjunior501-cell/the-red", 14, False, MUTED),
    ]
    for i, (txt, sz, bold, col) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(4)
        r = p.add_run()
        r.text = txt
        set_run(r, sz, bold, col)
    notes(
        s,
        "Bonjour. Je présente THE RED, application mobile pour les fans de Manchester United. "
        "Problème : info dispersée. MVP : Match Center, News, Community + Live/Programme/Mon XI.",
    )

    # ── 2. AGENDA ─────────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Agenda")
    add_subtitle(s, "Parcours de la soutenance — 12 à 15 minutes + questions")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))
    items = [
        ("01", "Problème & vision MVP"),
        ("02", "Stack technologique justifiée"),
        ("03", "Architecture & flux de données"),
        ("04", "Base de données PostgreSQL"),
        ("05", "Frontend Expo — 3 concepts"),
        ("06", "Backend FastAPI — 3 concepts"),
        ("07", "API & intégrations externes"),
        ("08", "Tests, Git, démo & roadmap"),
    ]
    for i, (num, label) in enumerate(items):
        col = i % 2
        row = i // 2
        left = Inches(0.6) + col * Inches(6.2)
        top = Inches(1.7) + row * Inches(1.15)
        card = add_card(s, left, top, Inches(5.8), Inches(0.95))
        num_box = s.shapes.add_textbox(left + Inches(0.25), top + Inches(0.25), Inches(0.9), Inches(0.5))
        p = num_box.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = num
        set_run(r, 22, True, GOLD, "Georgia")
        lab = s.shapes.add_textbox(left + Inches(1.2), top + Inches(0.28), Inches(4.2), Inches(0.5))
        p = lab.text_frame.paragraphs[0]
        r = p.add_run()
        r.text = label
        set_run(r, 18, False, WHITE)
    add_footer(s, 2, total)
    notes(s, "Je vais couvrir stack, architecture, BDD, frontend, backend, API, puis la démo.")

    # ── 3. PROBLÈME & VISION ──────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Le problème & la vision")
    add_subtitle(s, "Une seule app pour tout l’univers Red Devils")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    add_card(s, Inches(0.5), Inches(1.7), Inches(4.0), Inches(4.6))
    t = s.shapes.add_textbox(Inches(0.75), Inches(1.95), Inches(3.5), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "AVANT"
    set_run(r, 14, True, GOLD)
    bullet_box(
        s,
        Inches(0.75),
        Inches(2.5),
        Inches(3.5),
        Inches(3.5),
        [
            "Scores sur une app",
            "News sur un site",
            "Calendrier ailleurs",
            "Zéro engagement unifié",
            "Expérience fragmentée",
        ],
        16,
    )

    add_card(s, Inches(4.8), Inches(1.7), Inches(7.8), Inches(4.6), RGBColor(0x22, 0x08, 0x08))
    t = s.shapes.add_textbox(Inches(5.1), Inches(1.95), Inches(7), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "THE RED — 3 PILIERS MVP"
    set_run(r, 14, True, GOLD)

    pillars = [
        ("⚽  Match Center", "Live, Programme, stats, compos, classement PL"),
        ("📰  United News", "Actualités club, moments forts, vidéos"),
        ("🗣️  Fan Community", "Posts, réactions, Mon XI, jeux United"),
    ]
    for i, (title, desc) in enumerate(pillars):
        top = Inches(2.55) + i * Inches(1.1)
        tb = s.shapes.add_textbox(Inches(5.1), top, Inches(7.2), Inches(0.9))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        set_run(r, 20, True, WHITE)
        p2 = tf.add_paragraph()
        r2 = p2.add_run()
        r2.text = desc
        set_run(r2, 15, False, MUTED)

    add_footer(s, 3, total)
    notes(
        s,
        "L’info United est dispersée. THE RED regroupe Match Center, News et Community. "
        "Règle d’or : 3 taps max depuis l’accueil.",
    )

    # ── 4. USER STORIES & FONCTIONNALITÉS ─────────────────────
    s = new_slide(prs)
    add_title(s, "Fonctionnalités livrées")
    add_subtitle(s, "Alignées sur les user stories fans")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    tabs = [
        ("HOME", "Prochain match, news, PL, hub jeux"),
        ("LIVE", "Score, chronologie, stats, compos"),
        ("PROGRAMME", "Calendrier saison complet"),
        ("MON XI", "Pick Your XI United gratuit"),
        ("VIDÉOS", "Highlights / contenus club"),
        ("COMMUNITY", "Posts, réactions, auth JWT"),
    ]
    for i, (title, desc) in enumerate(tabs):
        col = i % 3
        row = i // 3
        left = Inches(0.5) + col * Inches(4.2)
        top = Inches(1.7) + row * Inches(2.3)
        card = add_card(s, left, top, Inches(3.95), Inches(2.0))
        # red top strip on card
        strip = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(3.95), Inches(0.12))
        strip.fill.solid()
        strip.fill.fore_color.rgb = RED if row == 0 else GOLD
        strip.line.fill.background()
        tb = s.shapes.add_textbox(left + Inches(0.25), top + Inches(0.45), Inches(3.4), Inches(1.3))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        set_run(r, 18, True, GOLD)
        p2 = tf.add_paragraph()
        p2.space_before = Pt(10)
        r2 = p2.add_run()
        r2.text = desc
        set_run(r2, 15, False, OFF_WHITE)

    add_footer(s, 4, total)
    notes(
        s,
        "En tant que fan je veux voir le prochain match, le live, le programme, mon XI et les news. "
        "Tout est livré dans les 5 onglets + community backend.",
    )

    # ── 5. STACK ──────────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Stack technologique")
    add_subtitle(s, "Chaque choix répond à une contrainte MVP")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    stack = [
        ("Frontend", "Expo · React Native · TypeScript\nReact Navigation · TanStack Query"),
        ("Backend", "FastAPI · Pydantic v2 · JWT\nbcrypt · adaptateurs API"),
        ("Données", "PostgreSQL 16 · SQLAlchemy\nAlembic · AsyncStorage cache"),
        ("Ops & Qualité", "Docker Compose · Nginx\nPytest 5/5 · GitHub"),
        ("Sport data", "FotMob (fixtures, live,\nstats, compositions)"),
        ("Temps réel", "Firebase RTDB (optionnel)\nengagement Live"),
    ]
    for i, (title, body) in enumerate(stack):
        col = i % 3
        row = i // 3
        left = Inches(0.5) + col * Inches(4.2)
        top = Inches(1.65) + row * Inches(2.4)
        card = add_card(s, left, top, Inches(3.95), Inches(2.15))
        tb = s.shapes.add_textbox(left + Inches(0.25), top + Inches(0.3), Inches(3.4), Inches(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title.upper()
        set_run(r, 13, True, GOLD)
        for line in body.split("\n"):
            p2 = tf.add_paragraph()
            p2.space_before = Pt(6)
            r2 = p2.add_run()
            r2.text = line
            set_run(r2, 15, False, OFF_WHITE)

    add_footer(s, 5, total)
    notes(
        s,
        "Expo pour livrer iOS/Android vite. FastAPI pour API async + Swagger. "
        "Postgres pour le relationnel. FotMob pour le calendrier live riche. Docker pour la reproductibilité.",
    )

    # ── 6. ARCHITECTURE ───────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Architecture 3-tiers")
    add_subtitle(s, "Séparation des responsabilités & résilience")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    layers = [
        ("1. CLIENT", "Expo App\nHooks + cache\nUI THE RED", RED),
        ("2. GATEWAY", "Nginx\nProxy · CORS\nSecurity headers", SOFT_RED),
        ("3. API", "FastAPI\nRouters · JWT\nAdapters", RGBColor(0x99, 0x1B, 0x1B)),
        ("4. DATA", "PostgreSQL\nUsers · Matches\nCommunity · News", RGBColor(0x45, 0x0A, 0x0A)),
    ]
    for i, (title, body, color) in enumerate(layers):
        left = Inches(0.45) + i * Inches(3.2)
        card = s.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.7), Inches(3.0), Inches(3.3)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = color
        card.line.fill.background()
        tb = s.shapes.add_textbox(left + Inches(0.2), Inches(2.0), Inches(2.6), Inches(2.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        set_run(r, 16, True, GOLD)
        for line in body.split("\n"):
            p2 = tf.add_paragraph()
            p2.space_before = Pt(10)
            r2 = p2.add_run()
            r2.text = line
            set_run(r2, 16, False, WHITE)

    # bottom note
    note = add_card(s, Inches(0.5), Inches(5.3), Inches(12.3), Inches(1.2))
    tb = s.shapes.add_textbox(Inches(0.8), Inches(5.5), Inches(11.8), Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "Principe clé : le backend isole les API tierces ; le mobile enrichit le Live/Programme via services typés + cache, avec dégradation propre si le réseau tombe."
    set_run(r, 15, False, OFF_WHITE)

    add_footer(s, 6, total)
    notes(
        s,
        "Client → Nginx → FastAPI → Postgres. Les adaptateurs isolent FotMob/News. "
        "Stateless JWT. Offline-first côté mobile.",
    )

    # ── 7. FLUX LIVE ──────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Flux de données — Live United")
    add_subtitle(s, "Du calendrier au centre match (score · chronologie · stats · compos)")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    steps = [
        ("01", "fetchUnitedLiveSection", "Calendrier équipe 10260"),
        ("02", "Détection match live", "overview + fixtures"),
        ("03", "matchDetails FotMob", "score, events, stats, XI"),
        ("04", "Polling 12–20 s", "UI détail temps réel"),
        ("05", "Onglets détail", "Match · Stats · Compos · H2H · PL"),
    ]
    for i, (num, title, desc) in enumerate(steps):
        top = Inches(1.65) + i * Inches(0.9)
        num_shape = s.shapes.add_shape(
            MSO_SHAPE.OVAL, Inches(0.7), top + Inches(0.1), Inches(0.7), Inches(0.7)
        )
        num_shape.fill.solid()
        num_shape.fill.fore_color.rgb = RED
        num_shape.line.fill.background()
        tf = num_shape.text_frame
        tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        r = tf.paragraphs[0].add_run()
        r.text = num
        set_run(r, 14, True, WHITE)

        if i < len(steps) - 1:
            connector = s.shapes.add_shape(
                MSO_SHAPE.RECTANGLE, Inches(1.0), top + Inches(0.8), Inches(0.08), Inches(0.25)
            )
            connector.fill.solid()
            connector.fill.fore_color.rgb = GOLD
            connector.line.fill.background()

        card = add_card(s, Inches(1.7), top, Inches(10.8), Inches(0.8))
        tb = s.shapes.add_textbox(Inches(2.0), top + Inches(0.15), Inches(10), Inches(0.55))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        set_run(r, 18, True, WHITE)
        p2 = tf.add_paragraph()
        r2 = p2.add_run()
        r2.text = desc
        set_run(r2, 13, False, MUTED)

    add_footer(s, 7, total)
    notes(
        s,
        "Live appelle fetchUnitedLiveSection, détecte le match en cours, charge matchDetails, "
        "poll pendant le live, affiche Match/Stats/Compos/H2H/PL.",
    )

    # ── 8. SÉCURITÉ & PERF ────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Sécurité & performance")
    add_subtitle(s, "État actuel + 2 améliorations chacune (critère architecture)")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    # Security card
    add_card(s, Inches(0.5), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(0.8), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "🔒  SÉCURITÉ"
    set_run(r, 18, True, GOLD)
    bullet_box(
        s,
        Inches(0.8),
        Inches(2.55),
        Inches(5.4),
        Inches(3.6),
        [
            "Aujourd’hui : bcrypt + JWT HS256 + Nginx headers",
            "Validation Pydantic (anti-payloads malformés)",
            "ORM paramétré (anti-injection SQL)",
            "Amélioration 1 : rotation secrets + env only",
            "Amélioration 2 : rate-limit login + refresh tokens",
        ],
        15,
    )

    add_card(s, Inches(6.8), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "⚡  PERFORMANCE"
    set_run(r, 18, True, GOLD)
    bullet_box(
        s,
        Inches(7.1),
        Inches(2.55),
        Inches(5.4),
        Inches(3.6),
        [
            "Aujourd’hui : cache AsyncStorage + TanStack Query",
            "Polling ciblé uniquement en live",
            "Index BDD sur email, kickoff, created_at",
            "Amélioration 1 : Redis TTL sur /matches & /news",
            "Amélioration 2 : ETag / pagination agressive",
        ],
        15,
    )

    add_footer(s, 8, total)
    notes(
        s,
        "Sécurité actuelle bcrypt/JWT/Nginx. Amélios : rotation secrets, refresh tokens. "
        "Perf : cache client. Amélios : Redis, ETag.",
    )

    # ── 9. BDD ────────────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Base de données PostgreSQL")
    add_subtitle(s, "Modèle relationnel aligné sur le métier fan")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    tables = [
        ("USERS", "auth, email unique"),
        ("PROFILES", "1:1 public / privé"),
        ("MATCHES", "external_id, scores"),
        ("NEWS", "articles club"),
        ("POSTS", " mur communautaire"),
        ("COMMENTS", " CASCADE"),
        ("REACTIONS", "red · like · fire"),
    ]
    for i, (name, desc) in enumerate(tables):
        left = Inches(0.45) + i * Inches(1.8)
        card = add_card(s, left, Inches(1.7), Inches(1.7), Inches(2.0))
        tb = s.shapes.add_textbox(left + Inches(0.08), Inches(2.05), Inches(1.55), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.paragraphs[0].alignment = PP_ALIGN.CENTER
        r = tf.paragraphs[0].add_run()
        r.text = name
        set_run(r, 12, True, GOLD)
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(8)
        r2 = p2.add_run()
        r2.text = desc
        set_run(r2, 11, False, MUTED)

    reasons = [
        "Pourquoi Postgres ? Relations fortes (user→posts→reactions), ACID, migrations Alembic.",
        "users ≠ profiles : séparer credentials et données publiques.",
        "matches.external_id : déduplication des syncs API sportives.",
        "Amélioration stockage 1 : archiver / partitionner les vieux posts.",
        "Amélioration perf 2 : index composites (match_id, created_at) + JSONB stats éphémères hors OLTP.",
    ]
    bullet_box(s, Inches(0.6), Inches(4.0), Inches(12), Inches(2.5), reasons, 15)
    add_footer(s, 9, total)
    notes(
        s,
        "Postgres car métier relationnel. users/profiles séparés. CASCADE. "
        "Amélios : archive posts, index composites, stats live hors Postgres chaud.",
    )

    # ── 10. FRONTEND ──────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Frontend — 3 concepts clés")
    add_subtitle(s, "Code à ouvrir : AppTabs · useMatchDetails · ProgrammeScreen")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    concepts = [
        (
            "01  Navigation modulaire",
            [
                "Bottom tabs : Home, Live, Vidéos, Mon XI, Programme",
                "Stacks imbriqués pour le détail match",
                "Respect de la règle des 3 taps",
            ],
        ),
        (
            "02  Hooks & données",
            [
                "useLiveMatches / useMatchDetails / useUnitedProgramme",
                "TanStack Query : cache, stale, refetch",
                "Polling uniquement quand le match est live",
            ],
        ),
        (
            "03  Design system THE RED",
            [
                "Tokens #DA291C / #FBE122 / Old Trafford dark",
                "ScreenAmbience + cartes interactives",
                "Composants réutilisables (FeaturedMatch, Pitch…)",
            ],
        ),
    ]
    for i, (title, bullets) in enumerate(concepts):
        left = Inches(0.4) + i * Inches(4.25)
        add_card(s, left, Inches(1.7), Inches(4.05), Inches(4.7))
        tb = s.shapes.add_textbox(left + Inches(0.25), Inches(1.95), Inches(3.55), Inches(0.5))
        r = tb.text_frame.paragraphs[0].add_run()
        r.text = title
        set_run(r, 15, True, GOLD)
        bullet_box(s, left + Inches(0.2), Inches(2.6), Inches(3.6), Inches(3.4), bullets, 14)

    add_footer(s, 10, total)
    notes(
        s,
        "Trois concepts : navigation tabs, hooks de données avec polling, design system THE RED. "
        "Je peux ouvrir AppTabs.tsx, useMatchDetails.ts, ProgrammeScreen.",
    )

    # ── 11. BACKEND ───────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Backend — 3 concepts clés")
    add_subtitle(s, "Code à ouvrir : main.py · auth.py · models/schemas")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    concepts = [
        (
            "01  Routers domaine",
            [
                "/api/v1/auth",
                "/api/v1/users",
                "/api/v1/matches",
                "/api/v1/news",
                "/api/v1/community",
                "Swagger auto : /docs",
            ],
        ),
        (
            "02  Auth sécurisée",
            [
                "Register → bcrypt hash",
                "Login → JWT Bearer",
                "Depends() sur routes protégées",
                "422 Pydantic si payload invalide",
            ],
        ),
        (
            "03  Adaptateurs externes",
            [
                "integrations/football.py",
                "integrations/news.py",
                "Normalisation + mocks",
                "Fallback si API tierce down",
            ],
        ),
    ]
    for i, (title, bullets) in enumerate(concepts):
        left = Inches(0.4) + i * Inches(4.25)
        add_card(s, left, Inches(1.7), Inches(4.05), Inches(4.7))
        tb = s.shapes.add_textbox(left + Inches(0.25), Inches(1.95), Inches(3.55), Inches(0.5))
        r = tb.text_frame.paragraphs[0].add_run()
        r.text = title
        set_run(r, 15, True, GOLD)
        bullet_box(s, left + Inches(0.2), Inches(2.6), Inches(3.6), Inches(3.4), bullets, 14)

    add_footer(s, 11, total)
    notes(
        s,
        "Routers par domaine, JWT+bcrypt, adaptateurs avec mocks. "
        "Pytest 5/5 prouve le flux auth et les contrats.",
    )

    # ── 12. API & INTÉGRATIONS ─────────────────────────────────
    s = new_slide(prs)
    add_title(s, "API & intégrations")
    add_subtitle(s, "Contrats internes + sources externes testées")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    add_card(s, Inches(0.5), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(0.8), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "API INTERNE THE RED"
    set_run(r, 16, True, GOLD)
    bullet_box(
        s,
        Inches(0.8),
        Inches(2.55),
        Inches(5.4),
        Inches(3.5),
        [
            "REST JSON versionné /api/v1",
            "Documentée README + Swagger",
            "Tests Pytest (health, auth, matches)",
            "Stateless — scalable horizontalement",
        ],
        15,
    )

    add_card(s, Inches(6.8), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "INTÉGRATIONS EXTERNES"
    set_run(r, 16, True, GOLD)
    bullet_box(
        s,
        Inches(7.1),
        Inches(2.55),
        Inches(5.4),
        Inches(3.5),
        [
            "FotMob → Programme / Live / stats / XI",
            "News club / OneFootball → fil United",
            "YouTube → highlights officiels",
            "Parse → type interne → cache → UI",
        ],
        15,
    )

    add_footer(s, 12, total)
    notes(
        s,
        "API interne testée. Externes : FotMob, news, YouTube. "
        "Toujours : parse typé, cache, dégradation propre.",
    )

    # ── 13. SPRINTS & GIT ─────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Sprints & contrôle de version")
    add_subtitle(s, "Organisation agile + GitHub professionnel")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    sprints = [
        ("S0", "Docker · Nginx · socle"),
        ("S1", "Auth JWT · users"),
        ("S2", "Match Center API"),
        ("S3", "United News"),
        ("S4", "Community"),
        ("S5", "Frontend Expo"),
        ("S6", "Live · Programme"),
        ("S7–8", "Mon XI · QA · docs"),
    ]
    for i, (sp, desc) in enumerate(sprints):
        col = i % 4
        row = i // 4
        left = Inches(0.5) + col * Inches(3.15)
        top = Inches(1.7) + row * Inches(1.7)
        card = add_card(s, left, top, Inches(3.0), Inches(1.45))
        tb = s.shapes.add_textbox(left + Inches(0.2), top + Inches(0.3), Inches(2.6), Inches(1.0))
        tf = tb.text_frame
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = sp
        set_run(r, 18, True, GOLD)
        p2 = tf.add_paragraph()
        p2.space_before = Pt(6)
        r2 = p2.add_run()
        r2.text = desc
        set_run(r2, 14, False, OFF_WHITE)

    note = add_card(s, Inches(0.5), Inches(5.3), Inches(12.3), Inches(1.2))
    tb = s.shapes.add_textbox(Inches(0.8), Inches(5.55), Inches(11.8), Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "GitHub  ·  branche main  ·  commits conventionnels (feat/fix/docs)  ·  secrets exclus (.env)  ·  README + PRESENTATION + PPTX"
    set_run(r, 15, False, OFF_WHITE)

    add_footer(s, 13, total)
    notes(
        s,
        "8 sprints itératifs. Projet individuel : j’ai porté PO/dev/QA. "
        "GitHub à jour, commits clairs, documentation complète.",
    )

    # ── 14. TESTS ─────────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Intégration & tests")
    add_subtitle(s, "Preuve de qualité — Pytest 5/5")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    add_card(s, Inches(0.5), Inches(1.8), Inches(7.5), Inches(4.5))
    t = s.shapes.add_textbox(Inches(0.85), Inches(2.1), Inches(7), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "CE QUI EST DÉMONTRÉ"
    set_run(r, 16, True, GOLD)
    bullet_box(
        s,
        Inches(0.85),
        Inches(2.7),
        Inches(6.9),
        Inches(3.3),
        [
            "Health check API",
            "Inscription → JWT → profil → update",
            "Contrat Pydantic des matchs United",
            "Compose Docker : Postgres + API + Nginx",
            "Intégration mobile Live / Programme / Home",
        ],
        16,
    )

    # big score card
    score = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.4), Inches(1.8), Inches(4.3), Inches(4.5)
    )
    score.fill.solid()
    score.fill.fore_color.rgb = RED
    score.line.fill.background()
    tb = s.shapes.add_textbox(Inches(8.6), Inches(2.8), Inches(3.9), Inches(2.5))
    tf = tb.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    r = tf.paragraphs[0].add_run()
    r.text = "5 / 5"
    set_run(r, 60, True, WHITE, "Georgia")
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(12)
    r2 = p2.add_run()
    r2.text = "tests Pytest passés"
    set_run(r2, 18, False, OFF_WHITE)
    p3 = tf.add_paragraph()
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(16)
    r3 = p3.add_run()
    r3.text = "cd backend && pytest"
    set_run(r3, 14, False, GOLD)

    add_footer(s, 14, total)
    notes(s, "Je lance pytest : 5 passés. Couvre health, auth complète, matches.")

    # ── 15. ROADMAP ───────────────────────────────────────────
    s = new_slide(prs)
    add_title(s, "Limites & prochaines étapes")
    add_subtitle(s, "Honnêteté technique = maturité d’ingénieur")
    add_gold_line(s, Inches(0.6), Inches(1.35), Inches(2.2))

    add_card(s, Inches(0.5), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(0.8), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "LIMITES ACTUELLES"
    set_run(r, 16, True, GOLD)
    bullet_box(
        s,
        Inches(0.8),
        Inches(2.55),
        Inches(5.4),
        Inches(3.5),
        [
            "Dépendance aux API sportives tierces",
            "JWT sans refresh token encore",
            "Community UX à enrichir",
            "Tests E2E mobile à industrialiser",
        ],
        15,
    )

    add_card(s, Inches(6.8), Inches(1.7), Inches(6.0), Inches(4.7))
    t = s.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.4), Inches(0.4))
    r = t.text_frame.paragraphs[0].add_run()
    r.text = "ROADMAP"
    set_run(r, 16, True, GOLD)
    bullet_box(
        s,
        Inches(7.1),
        Inches(2.55),
        Inches(5.4),
        Inches(3.5),
        [
            "Redis cache API",
            "Refresh tokens + rotation secrets",
            "Push notifications kickoff",
            "Tests E2E (Maestro / Detox)",
            "Remonter tout le sport data derrière FastAPI",
        ],
        15,
    )

    add_footer(s, 15, total)
    notes(
        s,
        "Je connais mes limites : APIs tierces, refresh tokens, E2E. "
        "Roadmap claire : Redis, push, tests E2E, centraliser les adapters.",
    )

    # ── 16. CLOSING ───────────────────────────────────────────
    s = new_slide(prs)
    panel = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
    panel.fill.solid()
    panel.fill.fore_color.rgb = RED
    panel.line.fill.background()
    g = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(6.9), W, Inches(0.12))
    g.fill.solid()
    g.fill.fore_color.rgb = GOLD
    g.line.fill.background()

    t = s.shapes.add_textbox(Inches(1), Inches(2.0), Inches(11.3), Inches(1))
    p = t.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "Merci."
    set_run(r, 54, True, WHITE, "Georgia")

    t2 = s.shapes.add_textbox(Inches(1), Inches(3.2), Inches(11.3), Inches(1.5))
    tf = t2.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "THE RED — architecture 3-tiers, MVP fan United,\nchoix justifiés, tests API, documentation claire."
    set_run(r, 20, False, OFF_WHITE)

    t3 = s.shapes.add_textbox(Inches(1), Inches(5.0), Inches(11.3), Inches(0.8))
    p = t3.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "Des questions ?"
    set_run(r, 28, True, GOLD, "Georgia")

    t4 = s.shapes.add_textbox(Inches(1), Inches(6.2), Inches(11.3), Inches(0.5))
    p = t4.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "Harold Nguemeta  ·  github.com/haroldjunior501-cell/the-red"
    set_run(r, 14, False, OFF_WHITE)

    notes(
        s,
        "THE RED montre une architecture complète, un MVP aligné user stories, "
        "des choix justifiés, des tests et une doc claire. Merci — prêt pour vos questions.",
    )

    prs.save(OUT)
    print(f"OK → {OUT}")


if __name__ == "__main__":
    build()
