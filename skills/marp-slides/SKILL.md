---
name: marp-slides
description: Write markdown presentations for import into Google Slides via the DHCraft Apps Script importer. Use this skill whenever the user wants to create, edit, or convert slide content in markdown, mentions Marp, .md slides, workshop slides, presentation decks, or the DHCraft Google Slides template. Also use when preparing content for dual rendering in Marp (HTML preview) and Google Slides (production), or when generating slide content that will end up in Google Slides with the dh-* layouts.
---

# DHCraft Slides Markdown

Write slide decks as markdown files that import cleanly into a DHCraft Google Slides template via the Apps Script importer. The same file also renders with Marp for quick HTML preview.

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

For citations, source notes, fine print. Renders as smaller paragraph at the bottom of the body.

- Inline: `<span class="small">Source: ...</span>`
- Block: `<div class="small">...</div>` wraps a paragraph or table.

## Speaker notes

`<!-- notes: ... -->` anywhere in a slide. Goes into the Google Slides speaker-notes pane.

## What the importer drops (so don't write these)

- Marp frontmatter (stripped entirely, but allowed for dual rendering)
- `<!-- _class: pause -->`, `<!-- _class: closing -->`, and any class other than `cover` or `blank`
- Images: `![](...)`, `<img>`. Add manually in Google Slides later.
- `<div class="warn">` and other custom callout boxes
- Marp `<!-- header: -->`, `<!-- footer: -->` directives; the template owns page numbers, logo, branding
- Raw HTML other than the allowed `div.columns`, `div.small`, `span.small`

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
