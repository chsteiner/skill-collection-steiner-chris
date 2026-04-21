# DHCraft Marp Slides Importer – Handoff

## Project
Container-bound Google Apps Script that imports Marp-compatible markdown into a DHCraft Google Slides template, replacing existing slides. Workflow: author decks in VS Code + Claude Code → import cleanly into Slides.

## Status
**Phase 5 complete. Daily-driver-ready.** Verified on real 76-slide deck (`ws3-datenmodell-deck.dhcraft.md`, 35.3KB, 0 warnings). User is ready for fine-tuning.

## Repo Files
Apps Script sources, all at repo root:
- `Code.gs` – menu, entrypoint, replace flow (Phase 5)
- `Parser.gs` – markdown → structured slide blocks
- `Renderer.gs` – blocks → Google Slides API calls (Phase 4 a+b+c)
- `LayoutResolver.gs` – dh-* layout lookup by display name
- `Test.gs` – parser unit tests runnable from Apps Script editor
- `Picker.html` – drop-zone UI, pre-flight confirm, auto-close
- `appsscript.json` – manifest (V8, Advanced Slides Service, scopes)
- `SETUP.md` – install walkthrough

## Template Layouts (set up in Google Slides master)
Five custom layouts with `dh-` display-name prefix:
- `dh-title` – Title + 2x Subtitle placeholders (idx 0 = subtitle line, idx 1 = author block)
- `dh-section` – Title only, big, centered
- `dh-content` – Title + Body (default)
- `dh-twocolumn` – Title + 2x Body (idx 0 left, idx 1 right)
- `dh-blank` – no placeholders (escape hatch)

## Markdown Contract (locked)

Slide separator: `---` on own line, not inside code fences.
Frontmatter: stripped entirely.

Slide type detection order:
1. `<!-- _class: cover -->` → title
2. `<!-- _class: blank -->` → blank
3. Body contains `<div class="columns">` → twocolumn
4. Lone `# H1` with no body → section (auto)
5. Else → content

Supported syntax:
- Paragraphs, bullet lists (2-space nesting), numbered lists
- Fenced code blocks, GFM tables, blockquotes
- Inline: `**bold**`, `*italic*`, `` `code` ``, `[text](url)`
- Small modifier: `<span class="small">...</span>` or block-wrapping `<div class="small">...</div>`
- Speaker notes: `<!-- notes: ... -->` anywhere
- Two-column: `<div class="columns"><div>...</div><div>...</div></div>`

Dropped: images, `<div class="warn">`, Marp directives (header/footer/pause/closing).

## Architecture Notes (non-obvious)

**Layout lookup.** Apps Script's `Slide.getLayout().getLayoutName()` returns internal names (`SECTION_HEADER`, `1_Titelfolie_1`), not the renamed display names. We use the Advanced Slides Service: `Slides.Presentations.get(id).layouts[].layoutProperties.displayName`.

**Replace flow.** Snapshot existing slides → render new slides at end → delete snapshotted slides. Append-then-delete is atomic-ish: if render produces 0 slides, old slides are kept as safety fallback. Confirm dialog shown only when existing count > 1 (fresh template copy has 1 placeholder, no confirm needed there).

**Text + table body slides.** Pragmatic 40% body-height split, table stacked below. Long text can clip, short text leaves gap. Accepted limitation.

**Body-only-table slides.** Body placeholder is removed entirely with `bodyShape.remove()`, table placed at body's original position/width.

**Title slide placeholders.** Title resolved via `findTitlePlaceholder` (accepts TITLE or CENTERED_TITLE). Subtitle and author via `getPlaceholder(SUBTITLE, 0)` and `(SUBTITLE, 1)`.

**Inline formatting.** Single combined regex with ordered alternatives (triple-star bold-italic, double-star bold, `__bold__`, backtick-code, link, single-star italic, `_italic_`). `setText` once, then per-segment format application in try/catch. Safety fallback `paraStart === i` prevents infinite loops on unrecognized input.

**Parser bugs fixed during Node.js local testing:**
- Twocolumn regex consumed final `</div>` → fixed with line-based depth tracking
- Infinite loop on `##` inside body → fixed with explicit heading-in-body guard

## Known Limitations (v1 accepted)

- **Italic `_word_` inside identifiers** like `project_id`, `source_of_truth` may mis-match when written in prose outside code spans. SKILL recommends `*italic*` for safety. **This is the #1 fine-tuning target.**
- **Bullet nesting** uses indent only. Marker cycling (disc → circle → square) depends on Apps Script's `applyListPreset`. Not yet verified on a real nested-list deck. Might need batchUpdate with `createParagraphBullets` + `nestingLevel` if broken.
- **Code-pseudo-tables** (triple-backtick with pipe-art, e.g. "Warum viele Spalten auch nicht helfen" slide) render as monospace code-blocks, not real tables. This is pedagogically correct, NOT A BUG.
- **OAuth consent per template copy.** Fix would be Editor Add-on refactor. Deferred until friction is real.

## Fine-Tuning Queue (priority order, user-approved)

1. **Italic regex harden** `[correctness, ~5 min]` — **DONE (2026-04-21)**
   Word-boundary lookbehind/lookahead guards around `_..._` and `*...*` italic patterns in `parseInline` (Parser.gs). Also applied to `__bold__` for consistency. Regression test: `test-italic.mjs`, run with `node tools/marp-importer/test-italic.mjs`.

2. **Table header background color** `[visual polish, medium]`
   Currently only bold. Add light grey (`#f1f3f4`) or DHCraft color fill for header row. Requires Advanced Slides Service `batchUpdate` with `updateTableCellProperties.tableCellBackgroundFill`. Modify `renderOneTable` in Renderer.gs.

3. **Verify nested bullets** `[verification only, cheap]`
   Build test deck with 3-level nesting. Check if marker cycles or just indents. If broken, switch to `createParagraphBullets` + `nestingLevel` via batchUpdate.

4. **Code block background** `[visual polish, medium]`
   Grey box behind code-block paragraphs. Either shape fill or paragraph-level background.

5. **Text + table dynamic split** `[refinement, medium]`
   Replace fixed 40% heuristic with estimate from paragraph char-count × font-size.

6. **Speaker notes markdown rendering** `[nice-to-have, small]`
   Currently plain text. Render bold/italic/bullets inside notes.

## Design Decisions (don't revisit)

- Container-bound script, not Editor Add-on – consent friction accepted for v1
- Markdown contract locked per `dhcraft-slides` SKILL (separate draft exists)
- No image support – intentional scope limit
- Append-then-delete replace flow – safer than delete-then-append
- Auto-close dialog after 1200ms on success with 0 warnings, stay open otherwise
- 1-slide threshold for replace confirm (fresh template has 1 placeholder)

## User Preferences

- Default English, German fine when contextually appropriate
- Never em-dashes or double-hyphens. German Gedankenstriche (– with spaces) are standard and fine
- Never produce docx or pdf. Markdown in chat or artifacts
- Direct and technical. No over-explanation of familiar concepts. Challenge unclear requirements rather than guess

## Next Action

Item 1 done. Next up is item 2 (table header background) for the biggest visual-polish win, or item 3 (verify nested bullets) if a test deck with 3-level nesting is available.

## Dev Workflow

Parser is testable standalone with Node.js (no Apps Script runtime needed) – use it. `Test.gs` has runnable unit tests inside Apps Script. For layout-dependent bugs, need real Slides presentation with the DHCraft template.
