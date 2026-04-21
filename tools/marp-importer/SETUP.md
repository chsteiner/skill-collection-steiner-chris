# Phases 1–3 Setup

## What's done so far

- **Phase 1**: menu, local file picker, file content reaches the backend
- **Phase 2**: markdown parser → Slide[] tree (title, section, content, twocolumn, blank)
- **Phase 3**: layout resolver + render skeleton. Imported slides are appended at the end using the correct `dh-*` layouts. Only titles / subtitles / author / notes are filled. Body rendering is Phase 4.

## Files in this folder

| File | Type | Purpose |
|------|------|---------|
| `Code.gs` | Script | Menu, dialog, `importFile` orchestration |
| `Parser.gs` | Script | Markdown → Slide[] |
| `LayoutResolver.gs` | Script | type → dh-* layout lookup, `verifyLayouts` menu helper |
| `Renderer.gs` | Script | Appends slides, fills title/subtitle/author/notes |
| `Test.gs` | Script | Parser test runners |
| `Picker.html` | HTML | Drop-zone dialog |
| `appsscript.json` | Manifest | OAuth scopes, timezone, V8 runtime |

## Installing Phase 3 on top of Phase 2

If you already installed Phase 2:

1. Open the Apps Script editor for the DHCraft Template.
2. Create two new Script files: `LayoutResolver` and `Renderer`. Paste contents from this folder.
3. Replace `Code.gs`, `Picker.html`, and `appsscript.json` with the updated versions.
4. **Enable the Slides Advanced Service.** This is required for reading layout display names:
   - Left sidebar → click **Services** (the "+" icon near the files list).
   - In the list that opens, find **Slides API** and click **Add**.
   - Confirm the identifier is `Slides` (capital S). Version `v1` is fine.
   - Click Add. The service now appears in your Services list.
5. Save all.
6. Reload the Slides tab. First action after reload will trigger a re-consent prompt because of the new Slides scope. Grant it.
7. The menu now has two items:
   - **Import .md…** — full pipeline (parse + append slides)
   - **Verify layouts** — reads your template's layouts and reports which dh-* are present

## Why the Slides Advanced Service

Apps Script's standard `Layout.getLayoutName()` returns the internal layout type (`SECTION_HEADER`, `TITLE_AND_BODY`, `CUSTOM`, etc.) or a Google-generated ID (`1_Titelfolie_1`), not the display name you set in the theme editor when you renamed layouts to `dh-title`, `dh-section`, and so on. To read those display names, the script queries the Slides REST API via the Advanced Service.

## First step: Verify layouts

Before running a real import, click **Marp Import → Verify layouts**.

Expected result:
- Alert dialog: "Found N layouts in template. All 5 dh-* layouts present."
- In Executions → Logs: a listing of every layout by name, placeholder count, and the dh-* resolution status.

If a layout is missing, the Log tells you which one. Go fix it in the theme editor (add the layout or rename) before importing.

## Testing Phase 3

Start with an empty test deck or a copy of your template so the appended slides don't clutter a real deck.

1. **Marp Import → Import .md…**
2. Drop a small test file or one of your real decks.
3. Status line reports "Appended N slides at end."
4. Check the Slides panel: N new slides at the end, each using the correct layout.

What to verify visually:
- **Title slide**: title, subtitle, and author populate the three placeholders on `dh-title` correctly.
- **Section slides**: title appears centered on `dh-section`.
- **Content and twocolumn slides**: title appears at top on `dh-content` / `dh-twocolumn`. Body placeholders are empty for now (Phase 4).
- **Blank slides**: appear as blank `dh-blank` layout.
- **Speaker notes**: open the notes pane under any slide that had `<!-- notes: -->`; the note text should be there.

## Expected warnings you can ignore for now

- Image drops, `<div class="warn">` drops, structural parse warnings from Phase 2
- Any body content referenced in the Logs but not yet rendered (Phase 4 territory)

## Real issues to investigate

- "Title placeholder not found": your layout is missing a TITLE placeholder, or it's typed as something other than TITLE / CENTERED_TITLE.
- "first/second Subtitle placeholder not found" on `dh-title`: the layout needs exactly two SUBTITLE placeholders in creation order (first = subtitle, second = author).
- "Template is missing layout X": name mismatch between template and the script. Check `dh-title`, `dh-section`, `dh-content`, `dh-twocolumn`, `dh-blank` exactly.

## Cleaning up after test imports

During Phase 3 testing you'll generate batches of test slides at the end of your deck. Select them in the Slides panel and delete. The importer doesn't do this for you yet — Phase 5 will.

## Next: Phase 4

Body rendering. Fills the Body placeholder on content and twocolumn slides with:
- Paragraphs (with inline bold / italic / code / links)
- Bullet lists (nested) and numbered lists
- Code blocks (monospace font applied to the body placeholder)
- Tables (inserted as real Google Slides tables below the body, or into the body area)
- Blockquotes
- Small-text paragraphs at smaller font size

After Phase 4 the imported slides are complete in content. Phase 5 then handles the replace flow: delete the existing slides and move the imported ones to the front.
