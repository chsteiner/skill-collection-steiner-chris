/**
 * DHCraft Marp Import — Phase 5 complete
 *
 * Menu → dialog → local .md → parse → render new slides → delete old
 * slides. Presentation ends up containing only the newly imported slides.
 *
 * Safety:
 *   - If parsing fails, nothing is touched.
 *   - Old slides are captured before rendering and only deleted if at
 *     least one new slide was rendered successfully.
 *   - If the presentation had >1 existing slide, the user is asked to
 *     confirm the replace in the dialog.
 */

const MENU_NAME = 'Marp Import';
const DIALOG_TITLE = 'Import .md file';
const DIALOG_WIDTH = 500;
const DIALOG_HEIGHT = 420;

function onOpen() {
  SlidesApp.getUi()
    .createMenu(MENU_NAME)
    .addItem('Import .md…', 'showImportDialog')
    .addSeparator()
    .addItem('Verify layouts', 'verifyLayouts')
    .addToUi();
}

function showImportDialog() {
  const html = HtmlService.createHtmlOutputFromFile('Picker')
    .setWidth(DIALOG_WIDTH)
    .setHeight(DIALOG_HEIGHT);
  SlidesApp.getUi().showModalDialog(html, DIALOG_TITLE);
}

/**
 * Lightweight pre-flight called by the dialog before the main import.
 * Used to decide whether to show the "replace N slides?" confirmation.
 */
function getExistingSlideCount() {
  return {
    existingSlides: SlidesApp.getActivePresentation().getSlides().length
  };
}

/**
 * Main pipeline. Called from Picker.html once the user has confirmed
 * (if needed) that replacing is OK.
 *
 * @param {{name: string, content: string}} file
 * @return summary for the dialog
 */
function importFile(file) {
  const name = file.name;
  const content = file.content;

  console.log('=== DHCraft Marp Import: Phase 5 ===');
  console.log('File: %s (%s chars, %s lines)',
              name, content.length, content.split('\n').length);

  // 1. Parse
  const parseResult = parseMarkdown(content);
  const warnings = parseResult.warnings.slice();
  console.log(summarizeParseResult(parseResult));

  if (parseResult.slides.length === 0) {
    return {
      name: name,
      parsed: 0,
      rendered: 0,
      deleted: 0,
      warnings: warnings.length,
      summary: 'No slides parsed from file. Nothing changed.'
    };
  }

  // 2. Capture snapshot of existing slides BEFORE we render anything
  const presentation = SlidesApp.getActivePresentation();
  const existingSlides = presentation.getSlides();
  const existingCount = existingSlides.length;
  console.log('Existing slides: %s', existingCount);

  // 3. Layout resolution
  const layoutMap = buildLayoutMap(presentation, warnings);
  console.log('--- Layout resolution ---');
  Object.keys(layoutMap).forEach(type => {
    const layout = layoutMap[type];
    console.log('  ' + type.padEnd(10) + ' → ' +
                (layout ? '"' + LAYOUT_NAMES[type] + '"' : 'MISSING (fallback)'));
  });

  // 4. Render new slides at end
  console.log('--- Rendering ---');
  const created = renderSlides(presentation, parseResult.slides, layoutMap, warnings);
  console.log('Rendered ' + created.length + ' new slides at end of presentation');

  // 5. Replace: delete old slides only if we have new ones to replace them with
  let deleted = 0;
  if (created.length > 0) {
    existingSlides.forEach((old, idx) => {
      try {
        old.remove();
        deleted++;
      } catch (e) {
        warnings.push('Could not delete old slide ' + (idx + 1) + ': ' + e.message);
      }
    });
    console.log('Deleted %s old slides', deleted);
  } else {
    console.log('No new slides rendered — keeping all existing slides as safety fallback');
    warnings.push('No new slides were rendered. Old slides were NOT deleted.');
  }

  // Warnings summary
  if (warnings.length > 0) {
    console.log('--- Warnings (' + warnings.length + ') ---');
    warnings.forEach(w => console.log('  •', w));
  }

  const summary = buildSummary(parseResult, created.length, deleted, existingCount);
  return {
    name: name,
    parsed: parseResult.slides.length,
    rendered: created.length,
    deleted: deleted,
    existingBefore: existingCount,
    warnings: warnings.length,
    summary: summary
  };
}

function buildSummary(parseResult, renderedCount, deletedCount, existingBefore) {
  const parsedSummary = summarizeParseResult(parseResult);
  if (renderedCount === 0) {
    return parsedSummary + ' Nothing rendered; presentation unchanged.';
  }
  if (deletedCount === 0 && existingBefore === 0) {
    return 'Imported ' + renderedCount + ' slides. ' + parsedSummary;
  }
  if (deletedCount > 0) {
    return 'Replaced ' + deletedCount + ' existing slides with ' + renderedCount +
           ' imported. ' + parsedSummary;
  }
  return 'Imported ' + renderedCount + ' slides (existing ' + existingBefore +
         ' kept). ' + parsedSummary;
}
