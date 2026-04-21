# DHCraft Marp Importer — Setup

Container-bound Apps Script that imports Marp markdown into a DHCraft Google Slides template, replacing the existing slides. Phase 5 complete.

## Files

| File | Type | Purpose |
|------|------|---------|
| `Code.gs` | Script | Menu, dialog, replace-flow orchestration |
| `Parser.gs` | Script | Markdown → structured Slide[] |
| `LayoutResolver.gs` | Script | Maps slide types to `dh-*` layouts via Advanced Slides Service |
| `Renderer.gs` | Script | Renders title / subtitle / author / body / tables / notes |
| `Test.gs` | Script | Parser unit tests runnable from the Apps Script editor |
| `Picker.html` | HTML | Drop-zone dialog + pre-flight confirmation |
| `appsscript.json` | Manifest | OAuth scopes, timezone, V8 runtime |
| `test-italic.mjs` | Node test | Regression guard for the italic regex |

## Prerequisites

A Google Slides presentation used as the DHCraft template with five custom layouts named exactly:

- `dh-title` — Title + 2× Subtitle placeholders (first = subtitle, second = author)
- `dh-section` — Title only, large, centered
- `dh-content` — Title + Body
- `dh-twocolumn` — Title + 2× Body (left, right)
- `dh-blank` — no placeholders

## Install

1. Open the template presentation → **Extensions → Apps Script**.
2. Delete the default `Code.gs`.
3. Create each script file from this folder (`Code`, `Parser`, `LayoutResolver`, `Renderer`, `Test`) and paste the contents.
4. Create an HTML file `Picker` and paste `Picker.html`.
5. Replace `appsscript.json` (under **Project Settings → Show "appsscript.json"**) with the one in this folder.
6. **Enable the Slides Advanced Service** (required for reading layout display names):
   - Left sidebar → click **Services** (the "+" icon near the files list)
   - Find **Slides API** in the list and click **Add**
   - Identifier: `Slides` (capital S). Version: `v1`.
7. Save all.
8. Reload the Slides tab. On the first action you'll see a re-consent prompt (new Slides scope). Grant it.

The menu `Marp Import` appears in the Slides toolbar with two items:

- **Import .md…** — full pipeline (parse → render → replace)
- **Verify layouts** — reads the template's layouts and reports which `dh-*` are present

## First run: Verify layouts

Before the first real import, click **Marp Import → Verify layouts**. Expected result:

- Alert: "Found N layouts in template. All 5 dh-* layouts present."
- Executions → Logs lists every layout by name, placeholder count, and resolution status.

If a layout is missing, the Log tells you which. Fix it in the theme editor (add / rename) before importing.

## Using it

1. **Marp Import → Import .md…**
2. Drop a `.md` file into the dialog or click to pick one.
3. Pre-flight: if the presentation already has more than one slide, the dialog shows a confirm step ("Replace N existing slides?"). Click **Replace** to proceed.
4. Status line reports: parsed / rendered / deleted / warnings.
5. On success with zero warnings, the dialog auto-closes after 1.2 s. With warnings, it stays open so you can read them.

What the replace flow does:

- Snapshot the existing slides
- Render new slides at the end of the deck
- Delete the snapshotted slides
- If rendering produces zero slides, the snapshot is kept as a safety fallback

## Verified on

Real 76-slide deck (`ws3-datenmodell-deck.dhcraft.md`, ~35 KB, 0 warnings). Daily-driver-ready.

## Regression test: italic regex

```bash
node tools/marp-importer/test-italic.mjs
```

Checks that underscore-italic (`_word_`) does not mis-match identifiers like `project_id`, `source_of_truth` when written in prose.

## Troubleshooting

**"Title placeholder not found"** — the layout is missing a TITLE placeholder, or it's typed as something other than TITLE / CENTERED_TITLE.

**"first/second Subtitle placeholder not found"** on `dh-title` — the layout needs exactly two SUBTITLE placeholders; first is the subtitle, second the author block.

**"Template is missing layout X"** — display-name mismatch. Check `dh-title`, `dh-section`, `dh-content`, `dh-twocolumn`, `dh-blank` in the theme editor match exactly.

**Warnings about dropped content** — images, `<div class="warn">`, and Marp `header:` / `footer:` / `pause:` / `closing:` directives are intentionally dropped. The authored markdown should follow the [marp-slides skill contract](../../skills/marp-slides/SKILL.md).

## Next fine-tuning steps

See [HANDOFF.md](HANDOFF.md) for the prioritized queue (table header backgrounds, nested bullets verification, code-block styling, etc.).
