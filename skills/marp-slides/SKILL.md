---
name: marp-slides
description: Write markdown presentations for import into Google Slides via the DHCraft Apps Script importer. Use this skill whenever the user wants to create, edit, or convert slide content in markdown, mentions Marp, .md slides, workshop slides, presentation decks, or the DHCraft Google Slides template. Also use when preparing content for dual rendering in Marp (HTML preview) and Google Slides (production), or when generating slide content that will end up in Google Slides with the dh-* layouts.
---

# DHCraft Slides Markdown

Write slide decks as markdown files that import cleanly into a DHCraft Google Slides template via the Apps Script importer. The same file also renders with Marp for quick HTML preview.

## Mode detection

This skill operates in two modes. Decide which up front:

- **Build mode** — the user wants a new deck built from scratch or from raw content they hand you (notes, an outline, transcript, paper). Output is fresh markdown following the conventions below.
- **Normalize mode** — the user has an existing Marp deck (often authored externally for vanilla Marp, another template, or by a colleague) and wants it rewritten to import cleanly via the DHCraft Apps Script importer. Output is the same deck, edited to comply with the rules in this document.

If the situation is ambiguous, ask: *"Should I build a new deck, or make an existing one import-ready?"*

In both modes, the final markdown must follow the rules below. Build mode produces compliant output in one shot; Normalize mode's job is specifically to identify violations in received content and fix them. The full normalize checklist lives further down — read the conventions first so you know what "compliant" looks like.

## Layout mapping

Each slide maps to one layout in the DHCraft template:

| Slide type | Layout | Detected by |
|---|---|---|
| Title | `dh-title` | `<!-- _class: cover -->` |
| Section | `dh-section` | lone `# H1` with no body content |
| Content | `dh-content` | default fallback |
| Two-column | `dh-twocolumn` | body contains `<div class="columns">` |
| Blank | `dh-blank` | `<!-- _class: blank -->` |

## File structure

- Optional YAML frontmatter at the top (for Marp rendering only; stripped by the importer).
- Slides separated by `---` on its own line.
- First slide that's not frontmatter is slide 1.

```markdown
---
marp: true
theme: default
paginate: true
---

<!-- _class: cover -->

# Workshop Title

## Subtitle: one-line framing

### Christian Steiner

---

# Content slide goes next
```

## Slide types in detail

### Title slide

Required directive: `<!-- _class: cover -->`.

```markdown
<!-- _class: cover -->

# Main title

## Subtitle (optional)

### Author Name (optional)
```

Maps to: Title placeholder, first Subtitle placeholder, second Subtitle placeholder (author block).

### Section slide

No directive. Detected automatically when the entire slide contains only `# H1` and nothing else.

```markdown
# Block 2: Datenmodell mit Claude Code
```

Maps to: Title placeholder. `## H2` on a section slide is dropped by the importer.

### Content slide

Default. Anything not matching another type.

```markdown
# Heading of this slide

A prose paragraph introducing the topic. Write in full sentences where it flows better than bullets.

- Bullet one
- Bullet two
  - Nested bullet, max two levels deep
- Bullet three

1. Numbered item
2. Numbered item

Another paragraph between lists is fine.

```python
def example():
    return "code blocks render in monospace"
```

| Column A | Column B |
|----------|----------|
| Value    | Value    |

> Blockquote renders as italicised, left-indented paragraph.

<span class="small">Source: Author, *Title*, Year. https://example.org</span>

<!-- notes: Speaker notes, hidden on slide. -->
```

Maps to: Title placeholder, Body placeholder.

### Two-column slide

Detected automatically when body contains `<div class="columns">`.

```markdown
# Comparison

<div class="columns">
<div>

**Left column heading**

- point
- point

</div>
<div>

**Right column heading**

- point
- point

</div>
</div>
```

Maps to: Title placeholder, left Body, right Body. Each column accepts any content a normal content slide accepts.

### Blank slide

```markdown
<!-- _class: blank -->
```

Empty slide, to be designed manually in Google Slides after import. No further content needed.

## Inline formatting

- `**bold**` → bold
- `*italic*` or `_italic_` → italic
- `[link text](https://url)` → clickable link
- `` `inline code` `` → monospace

## Small text

For citations, source notes, fine print, figure captions. Renders as smaller paragraph at the bottom of the body.

Three equivalent forms, pick one per line:

- `<small>Source: ...</small>` — standard HTML, also renders smaller in vanilla Marp HTML preview. Preferred when writing a new deck.
- `<span class="small">Source: ...</span>` — legacy DHCraft form, still accepted by the importer.
- `<div class="small">...</div>` — wraps a block (paragraph or table) when multiple lines should all be small.

`<small>` can wrap inline formatting: `<small>*Caption in italic*</small>` works.

## Images

`![](url)` inserts an image into the body. Remote URLs (`https://...`) are fetched and embedded by the importer.

- `![](https://example.org/fig.png)` — default width, fits the body area.
- `![width:70%](https://example.org/fig.png)` — Marp size directive. `width:XX%` is read as a percentage of the slide width. `height:XXpx` also works.
- `![](img/local-file.png)` — **relative paths don't resolve** from the Apps Script runtime. Either host the file publicly and use the full URL, or drop the image with a `<!-- IMAGE: short description — add manually after import -->` placeholder.

Caption pattern: put the `<small>` line on the line after the image.

```markdown
![width:75%](https://example.org/fig-workflow.png)

<small>*Three automation logics with different bias sources.*</small>
```

## Speaker notes

`<!-- notes: ... -->` anywhere in a slide. Goes into the Google Slides speaker-notes pane.

**The `notes:` prefix is required.** A generic HTML comment without it (`<!-- 45 min block, walk through the table -->`) looks like speaker notes but is silently stripped by the importer. When you see a dangling in-body comment that describes the slide content, rewrite it to `<!-- notes: ... -->`. Non-notes metadata (version history, author TODOs) belong at the very top of the file, before any slide content.

## What the importer drops (so don't write these)

- Marp frontmatter (stripped entirely, but allowed for dual rendering)
- `<!-- _class: pause -->`, `<!-- _class: closing -->`, and any class other than `cover` or `blank`
- Raw `<img>` tags. Use `![](url)` instead.
- `<div class="warn">` and other custom callout boxes
- Marp `<!-- header: -->`, `<!-- footer: -->` directives; the template owns page numbers, logo, branding
- Raw HTML other than the allowed `div.columns`, `div.small`, `span.small`, `<small>`

## Writing style

- German Gedankenstriche (`–` with spaces, en dash) are fine. Never em-dash (`—`) or double-hyphen (`--`).
- Prose over bullets when it reads naturally. Bullets only for genuinely parallel items.
- Cite sources with `<span class="small">` or `<div class="small">`, never inline footnote markers.
- Nested bullets max two levels. Readers stop tracking deeper hierarchy.
- Code blocks short enough to read at presentation distance: under 15 lines, preferably under 10.
- Tables are legitimate for comparisons and matrices. Don't use them as layout tricks for formatted text.
- Slide density: 30 to 80 words of body content is the sweet spot. Over 120 words: split the slide.

## Minimal example: complete deck

```markdown
---
marp: true
theme: default
paginate: true
---

<!-- _class: cover -->

# Context Engineering für Forschungsdaten

## Workshop am IDea_Lab · 28. April 2026

### Christian Steiner

---

# Block 1: Was ist Context Engineering

---

# Drei Schichten

**Ebene 1 - System-Instruktionen:** persistente Rollendefinition.

**Ebene 2 - Projekt-Kontext:** kuratierte Wissensbasis.

**Ebene 3 - Einzel-Prompt:** die konkrete Aufgabe.

Die meiste Wirkung entsteht in Ebene 1 und 2.

<span class="small">Quelle: Anthropic Engineering, *Effective context engineering for AI agents*, 2025.</span>

---

# Zwei Ansätze

<div class="columns">
<div>

**Prompt Engineering**

- formulierungsbasiert
- pro Anfrage optimiert
- Chain-of-Thought, Role-Prompting

</div>
<div>

**Context Engineering**

- strukturell
- projekt-persistent
- Distillation, Kuration

</div>
</div>

---

# Beispiel-Pipeline

```python
def build_context(project, query):
    docs = load_distilled_docs(project)
    return system_prompt + docs + query
```

<!-- notes: Hier die Live-Demo mit Claude Code starten. -->

---

<!-- _class: blank -->
```

## Normalize mode: making an external deck import-ready

When the user hands you an existing Marp deck and wants it imported via the DHCraft importer, run this checklist. External decks typically violate 3–7 of these — fix each one, explain briefly what you changed, and return the revised markdown. Don't rewrite the *content* unless the user asks; just make the markdown compliant.

### 1. Slide-title heading level

If a content slide starts with `## Foo` and has no preceding `# H1`, **promote `##` to `#`**. The importer tolerates `##` as a fallback title so old decks don't silently lose their titles, but `#` is the contract: keeps layout mapping unambiguous and respects Marp's own H1-as-slide-title convention.

Edge case: if the deck uses `#` as a section-slide title and `##` as the first heading of following content slides, the author probably intended the `##` as the slide title. Promote them.

### 2. Title-slide directive on slide 1

If slide 1 reads as a title page (H1 plus subtitle/author information), add `<!-- _class: cover -->` at the very top. Then reshape the content to fit the `dh-title` layout's three text slots:

- Exactly one `# H1` — the title.
- One `## H2` — the subtitle. If the original has multiple subtitle-like lines, merge them with a bullet separator (`Session 3 · Gender, Diversity & AI · Klagenfurt SS2026`) or pick the most load-bearing one.
- One `### H3` — the author (or author + affiliation).
- Anything else — demote to `<small>` on a body line, or cut.

Don't leave extra paragraphs on a title slide. The importer warns and drops them, but the warning is silent in practice; cleaner to fix it in normalize.

### 3. Images

The importer inserts remote-URL images directly. For external decks that reference local paths (`img/fig.png`), one of:

- **Best:** host the image publicly (GitHub Raw URL, DHCraft static, imgur, etc.) and rewrite the path to the full URL.
- **Second-best:** replace with `<!-- IMAGE: short description of what the figure shows — add manually after import -->`. The comment survives the markdown and gives the author a TODO in the Google Slides deck.

Preserve Marp size directives: `![width:75%](url)` stays `![width:75%](...)`. Don't strip them.

### 4. `<small>` vs. `<span class="small">`

Both work. If the deck already uses one consistently, leave it. If it's a mix, normalize to `<small>` (shorter, standard HTML, also renders smaller in vanilla Marp preview).

### 5. In-body HTML comments without `notes:` prefix

A `<!-- ... -->` block inside slide content that describes the slide (e.g. `<!-- 45 min block, walk through the cluster table then student presentations -->`) is almost always a dropped speaker note. Rewrite to `<!-- notes: ... -->`.

Exceptions: top-of-file metadata comments (version history, load-bearing-slide index, review log) can stay at the very top of the file. They sit before any slide content and are stripped silently — that's intended.

### 6. Em-dash → en-dash with spaces

Global replace `—` with ` – ` (space, en-dash, space). Skill convention, holds in both rendering paths.

Don't touch em-dashes inside code blocks or code spans.

### 7. Forbidden classes and tags

Remove or rewrite:

- `<!-- _class: pause -->`, `<!-- _class: closing -->`, and anything other than `cover`, `blank` → delete the directive.
- `<div class="warn">` and other callouts → promote the content to a plain blockquote or drop the wrapper.
- Raw `<img src="...">` → convert to `![](url)` or drop with a placeholder.
- Marp `<!-- header: -->`, `<!-- footer: -->` → delete. The template owns those.

After these seven passes, run the overflow check (`scripts/check-slide-overflow.mjs`) to catch any slide whose content doesn't fit the canvas.

## QA: overflow check

After writing a deck, verify that no slide exceeds its canvas. `scripts/check-slide-overflow.mjs` renders the deck with `marp-cli`, loads it in headless Chromium via Playwright, and measures `scrollHeight` vs `clientHeight` per `<section>`. It reports every slide whose content overflows — the kind of failure you can't see in the markdown but that shows up as clipped text in the Google Slides import or the Marp HTML preview.

Requirements: `marp-cli` in PATH, `npm install -g playwright`, `npx playwright install chromium`.

Run from repo root:

```bash
node skills/marp-slides/scripts/check-slide-overflow.mjs path/to/deck.md
```

Exit code 3 if any slide overflows; otherwise 0. Typical culprits: too many bullets, tables that ran over, a section with more than one heading level accidentally turning into a content slide.

## Troubleshooting

- **Title slide loses author line**: `### H3` missing, or the second Subtitle placeholder in `dh-title` doesn't exist in this specific template. Check the template.
- **Section slide renders as content**: the slide has hidden content below the `# H1`. Remove blank lines containing invisible characters.
- **Subtitle missing on section slide**: section slides don't support subtitles by design. Move the subtitle text into the next content slide's heading, or prepend it to the section title after a colon.
- **Two-column not splitting**: `<div class="columns">` must contain exactly two `<div>` children. More or fewer columns aren't supported.
- **Table not rendering**: importer supports standard GFM tables only. No colspan, no rowspan, no cell-level formatting.
