/**
 * DHCraft Marp Import — Phase 5 complete + Phase 3 safety
 *
 * Menu → dialog → local .md → parse → render new slides → delete old
 * slides. Presentation ends up containing only the newly imported slides.
 *
 * Transactional safety (Phase 3):
 *   - Parse-time failure → nothing touched.
 *   - Missing template layouts → abort before rendering; presentation
 *     untouched (prevents BLANK-fallback wipeout).
 *   - Render-time failure on any slide → roll back every newly appended
 *     slide (including the failed one), keep old slides intact.
 *   - Old slides are only deleted when the full render succeeded AND
 *     the rendered count matches the parsed count.
 *   - DocumentLock prevents two imports colliding on the same deck.
 *   - >1 existing slide → UI asks the user to confirm.
 */

const MENU_NAME = 'Marp Import';
const DIALOG_TITLE = 'Import .md file';
const DIALOG_WIDTH = 500;
const DIALOG_HEIGHT = 420;
const IMPORT_LOCK_WAIT_MS = 5000;

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
 * Acquires a DocumentLock for the whole run so two imports on the same
 * presentation can't race. The actual work is in importFileInternal —
 * this wrapper just handles the lock and makes sure it's released even
 * if the inner call throws.
 *
 * @param {{name: string, content: string}} file
 * @return summary for the dialog
 */
function importFile(file) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(IMPORT_LOCK_WAIT_MS)) {
    throw new Error(
      'Another import is already running on this presentation. ' +
      'Try again in a moment.'
    );
  }
  try {
    return importFileInternal(file);
  } finally {
    lock.releaseLock();
  }
}

function importFileInternal(file) {
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

  // 3. Layout resolution — abort early if template is incomplete. Without
  // this, the old BLANK fallback produced empty slides AND deleted the
  // user's existing content, leaving them with a blank presentation.
  const layoutMap = buildLayoutMap(presentation, warnings);
  console.log('--- Layout resolution ---');
  Object.keys(layoutMap).forEach(type => {
    const layout = layoutMap[type];
    console.log('  ' + type.padEnd(10) + ' → ' +
                (layout ? '"' + LAYOUT_NAMES[type] + '"' : 'MISSING'));
  });
  assertRequiredLayouts(layoutMap, parseResult.slides);

  // 4. Render new slides at end. The renderer returns two lists —
  // `created` (successful fills) and `attempted` (every appended slide,
  // success or fail). We need `attempted` to undo partial runs.
  console.log('--- Rendering ---');
  const renderResult = renderSlides(presentation, parseResult.slides, layoutMap, warnings);
  const created = renderResult.created;
  const attempted = renderResult.attempted;
  console.log('Rendered ' + created.length + '/' + parseResult.slides.length +
              ' new slides (' + attempted.length + ' appended)');

  // 5. Transaction gate. Anything less than a full render → roll back
  // and keep the user's old slides. The old code accepted
  // `created.length > 0` which would happily delete 36 old slides even
  // if the render only finished 1 of 43 new ones.
  if (created.length !== parseResult.slides.length) {
    console.log('Partial render — rolling back ' + attempted.length + ' new slide(s)');
    rollbackAttempted(attempted, warnings);
    throw new Error(
      'Rendered only ' + created.length + ' of ' + parseResult.slides.length +
      ' slides. Import aborted; old slides kept intact.'
    );
  }

  // 6. Replace: render succeeded, safe to delete old slides.
  let deleted = 0;
  existingSlides.forEach((old, idx) => {
    try {
      old.remove();
      deleted++;
    } catch (e) {
      warnings.push('Could not delete old slide ' + (idx + 1) + ': ' + e.message);
    }
  });
  console.log('Deleted %s old slides', deleted);

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

/**
 * Remove every slide in `attempted`. Called when the transaction is
 * rejected so the presentation returns to its pre-import state.
 * Individual remove failures are collected as warnings but don't abort
 * the rollback — we always want to remove as many as possible.
 */
function rollbackAttempted(attempted, warnings) {
  attempted.forEach((slide, idx) => {
    try {
      slide.remove();
    } catch (e) {
      warnings.push('Rollback: could not remove new slide ' + (idx + 1) +
                    ': ' + e.message);
    }
  });
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
