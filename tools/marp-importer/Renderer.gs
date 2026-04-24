/**
 * DHCraft Marp Import — Phase 4 complete (a + b + c + d)
 *
 * Body rendering:
 *   - paragraph, bulletList, numberedList, blockquote (Phase 4a)
 *   - codeBlock: monospace, smaller font (Phase 4b)
 *   - table: real Google Slides tables inserted below the body (Phase 4c)
 *   - image: remote-URL images inserted below the body, optional Marp
 *     width:XX% / height:XXpx sizing, aspect ratio preserved (Phase 4d)
 *   - small modifier on any block
 *   - two-column body splitting
 *
 * Tables and images together are called "visual blocks" and share the
 * stacking machinery below the body shape.
 *
 * Existing slides are untouched. Slides are appended at the end of the
 * presentation. Replace flow is Phase 5.
 */

const INDENT_PER_LEVEL_PT = 18;
const SMALL_FONT_SIZE_PT = 12;
const CODE_FONT_FAMILY = 'Roboto Mono';
const CODE_FONT_SIZE_PT = 11;
const BLOCKQUOTE_INDENT_PT = 18;

// Table layout
const TABLE_GAP_PT = 8;                // vertical gap between body and table / between tables
const TABLE_CELL_FONT_SIZE_PT = 12;
const TABLE_CELL_FONT_SIZE_SMALL_PT = 10;

// Image layout (images reuse TABLE_GAP_PT for stacking)
const IMAGE_DEFAULT_ASPECT = 0.6;  // fallback if native dimensions unavailable

// ---- Entry point ----

function renderSlides(presentation, slides, layoutMap, warnings) {
  const created = [];
  slides.forEach((slide, i) => {
    const slideNum = i + 1;
    try {
      const gSlide = appendSlideWithLayout(presentation, slide.type, layoutMap);

      if (slide.type === 'title') {
        fillTitleSlide(gSlide, slide, slideNum, warnings);
      } else if (slide.type === 'section') {
        fillTitle(gSlide, slide.title, slideNum, warnings);
      } else if (slide.type === 'content') {
        fillTitle(gSlide, slide.title, slideNum, warnings);
        fillBody(gSlide, slide.body, slideNum, warnings);
      } else if (slide.type === 'twocolumn') {
        fillTitle(gSlide, slide.title, slideNum, warnings);
        fillTwoColumnBody(gSlide, slide.columns, slideNum, warnings);
      }
      // blank: nothing to fill

      if (slide.notes) setSpeakerNotes(gSlide, slide.notes);
      created.push(gSlide);
    } catch (e) {
      warnings.push('Slide ' + slideNum + ' (' + slide.type + '): render error — ' + e.message);
    }
  });

  return created;
}

function appendSlideWithLayout(presentation, type, layoutMap) {
  const layout = layoutMap[type];
  return layout
    ? presentation.appendSlide(layout)
    : presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
}

// ---- Title / subtitle / author ----

function fillTitleSlide(gSlide, slide, slideNum, warnings) {
  if (slide.title) {
    const titlePh = findTitlePlaceholder(gSlide);
    if (titlePh) titlePh.asShape().getText().setText(slide.title);
    else warnings.push('Slide ' + slideNum + ' (title): Title placeholder not found');
  }
  if (slide.subtitle) {
    const sub0 = gSlide.getPlaceholder(SlidesApp.PlaceholderType.SUBTITLE, 0);
    if (sub0) sub0.asShape().getText().setText(slide.subtitle);
    else warnings.push('Slide ' + slideNum + ' (title): first SUBTITLE not found');
  }
  if (slide.author) {
    const sub1 = gSlide.getPlaceholder(SlidesApp.PlaceholderType.SUBTITLE, 1);
    if (sub1) sub1.asShape().getText().setText(slide.author);
    else warnings.push('Slide ' + slideNum + ' (title): second SUBTITLE (author) not found');
  }
}

function fillTitle(gSlide, titleText, slideNum, warnings) {
  if (!titleText) return;
  const titlePh = findTitlePlaceholder(gSlide);
  if (titlePh) titlePh.asShape().getText().setText(titleText);
  else warnings.push('Slide ' + slideNum + ': Title placeholder not found');
}

function findTitlePlaceholder(gSlide) {
  return gSlide.getPlaceholder(SlidesApp.PlaceholderType.TITLE) ||
         gSlide.getPlaceholder(SlidesApp.PlaceholderType.CENTERED_TITLE);
}

function setSpeakerNotes(gSlide, notesText) {
  try {
    const notesShape = gSlide.getNotesPage().getSpeakerNotesShape();
    if (notesShape) notesShape.getText().setText(notesText);
  } catch (e) { /* non-fatal */ }
}

// ---- Body ----

function fillBody(gSlide, blocks, slideNum, warnings) {
  const body = gSlide.getPlaceholder(SlidesApp.PlaceholderType.BODY);
  if (!body) {
    warnings.push('Slide ' + slideNum + ': Body placeholder not found');
    return;
  }
  renderBodyArea(gSlide, body.asShape(), blocks, slideNum, warnings);
}

function fillTwoColumnBody(gSlide, columns, slideNum, warnings) {
  [0, 1].forEach(idx => {
    const body = gSlide.getPlaceholder(SlidesApp.PlaceholderType.BODY, idx);
    if (!body) {
      warnings.push('Slide ' + slideNum + ' (twocolumn): BODY placeholder index ' + idx + ' not found');
      return;
    }
    renderBodyArea(gSlide, body.asShape(), columns[idx] || [], slideNum, warnings);
  });
}

/**
 * Render a body area: text blocks go into the given shape, visual blocks
 * (tables and images) are stacked below it in original document order.
 *
 * Special cases:
 *   - Body has no blocks at all: clear body text, return.
 *   - Body has only visuals: remove body placeholder and place them in
 *     its area.
 *   - Body has text + visuals: shrink body to make room, visuals below.
 *   - Body has only text: default behaviour.
 */
function renderBodyArea(gSlide, bodyShape, blocks, slideNum, warnings) {
  if (!blocks || blocks.length === 0) {
    bodyShape.getText().setText('');
    return;
  }
  const textBlocks = blocks.filter(b => b.kind !== 'table' && b.kind !== 'image');
  const visuals    = blocks.filter(b => b.kind === 'table' || b.kind === 'image');

  const left = bodyShape.getLeft();
  const top = bodyShape.getTop();
  const width = bodyShape.getWidth();
  const height = bodyShape.getHeight();

  if (textBlocks.length === 0 && visuals.length > 0) {
    // Visuals only: remove body placeholder, put visuals in its area
    try {
      bodyShape.getText().setText('');
      bodyShape.remove();
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': could not remove empty body: ' + e.message);
    }
    stackVisualsAt(gSlide, visuals, left, top, width, slideNum, warnings);
  } else if (visuals.length > 0) {
    // Mixed: shrink body to ~40% of height, visuals get the rest below
    const textHeight = height * 0.4;
    try { bodyShape.setHeight(textHeight); } catch (e) { /* non-fatal */ }
    renderBlocksIntoShape(bodyShape, textBlocks, slideNum, warnings);
    stackVisualsAt(gSlide, visuals, left, top + textHeight + TABLE_GAP_PT, width, slideNum, warnings);
  } else {
    // Text only
    renderBlocksIntoShape(bodyShape, textBlocks, slideNum, warnings);
  }
}

/**
 * Insert a stack of visual blocks (tables, images) starting at the given
 * top position. Each block computes its own height; the cursor advances
 * by that height plus TABLE_GAP_PT between blocks.
 */
function stackVisualsAt(gSlide, visuals, left, top, width, slideNum, warnings) {
  let cursorTop = top;
  visuals.forEach((v, idx) => {
    try {
      let h = 0;
      if (v.kind === 'table') {
        h = renderOneTable(gSlide, v, left, cursorTop, width, slideNum, idx, warnings);
      } else if (v.kind === 'image') {
        h = renderOneImage(gSlide, v, left, cursorTop, width, slideNum, idx, warnings);
      }
      cursorTop += h + TABLE_GAP_PT;
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': ' + v.kind + ' ' + idx + ' render error — ' + e.message);
    }
  });
}

// ---- Text block rendering ----

function renderBlocksIntoShape(shape, blocks, slideNum, warnings) {
  const text = shape.getText();
  text.setText('');
  if (!blocks || blocks.length === 0) return;

  let fullText = '';
  const segments = [];

  blocks.forEach((block, blockIdx) => {
    if (blockIdx > 0) fullText += '\n';

    switch (block.kind) {
      case 'paragraph':
      case 'blockquote': {
        const start = fullText.length;
        fullText += runsToText(block.runs);
        segments.push({ start, end: fullText.length, block, runs: block.runs });
        break;
      }
      case 'bulletList':
      case 'numberedList': {
        block.items.forEach((item, itemIdx) => {
          if (itemIdx > 0) fullText += '\n';
          const start = fullText.length;
          fullText += runsToText(item.runs);
          segments.push({ start, end: fullText.length, block, item, runs: item.runs });
        });
        break;
      }
      case 'codeBlock': {
        const start = fullText.length;
        fullText += block.text || '';
        segments.push({ start, end: fullText.length, block });
        break;
      }
    }
  });

  text.setText(fullText);

  segments.forEach((seg, idx) => {
    try {
      applySegmentFormatting(text, seg);
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': block ' + idx + ' (' + seg.block.kind +
                    ') formatting error — ' + e.message);
    }
  });
}

function runsToText(runs) {
  return (runs || []).map(r => r.text).join('');
}

function applySegmentFormatting(text, seg) {
  if (seg.end <= seg.start) return;
  const range = text.getRange(seg.start, seg.end);
  if (!range) return;

  const kind = seg.block.kind;

  if (kind === 'paragraph') {
    range.getListStyle().removeFromList();
  } else if (kind === 'bulletList') {
    range.getListStyle().applyListPreset(SlidesApp.ListPreset.DISC_CIRCLE_SQUARE);
    applyIndentForLevel(range, seg.item ? seg.item.level : 0);
  } else if (kind === 'numberedList') {
    range.getListStyle().applyListPreset(SlidesApp.ListPreset.DIGIT_ALPHA_ROMAN);
    applyIndentForLevel(range, seg.item ? seg.item.level : 0);
  } else if (kind === 'blockquote') {
    range.getListStyle().removeFromList();
    range.getTextStyle().setItalic(true);
    range.getParagraphStyle().setIndentStart(BLOCKQUOTE_INDENT_PT);
    range.getParagraphStyle().setIndentFirstLine(BLOCKQUOTE_INDENT_PT);
  } else if (kind === 'codeBlock') {
    range.getListStyle().removeFromList();
    range.getTextStyle().setFontFamily(CODE_FONT_FAMILY);
    range.getTextStyle().setFontSize(CODE_FONT_SIZE_PT);
  }

  if (seg.block.small) {
    range.getTextStyle().setFontSize(SMALL_FONT_SIZE_PT);
  }

  if (seg.runs) {
    applyInlineRuns(text, seg.start, seg.runs);
    // Blockquote + bold interaction: the base-italic set on the whole
    // blockquote range above fights bold runs inside the quotation, so
    // `> **emphasis** here` ends up bold-italic and the emphasis loses
    // its visual distinction. Clear italic on runs that are bold-only
    // (bold without an explicit italic flag from the author).
    if (kind === 'blockquote') {
      clearItalicOnBoldOnlyRuns(text, seg.start, seg.runs);
    }
  }
}

function clearItalicOnBoldOnlyRuns(text, offset, runs) {
  let pos = offset;
  runs.forEach(run => {
    const runEnd = pos + (run.text || '').length;
    if (run.bold && !run.italic && runEnd > pos) {
      const range = text.getRange(pos, runEnd);
      if (range) range.getTextStyle().setItalic(false);
    }
    pos = runEnd;
  });
}

function applyIndentForLevel(range, level) {
  if (!level || level <= 0) return;
  const indent = level * INDENT_PER_LEVEL_PT;
  range.getParagraphStyle().setIndentStart(indent);
  range.getParagraphStyle().setIndentFirstLine(indent);
}

function applyInlineRuns(text, offset, runs) {
  let pos = offset;
  runs.forEach(run => {
    const runEnd = pos + (run.text || '').length;
    const hasFormat = run.bold || run.italic || run.code || run.link;
    if (hasFormat && runEnd > pos) {
      const range = text.getRange(pos, runEnd);
      if (range) {
        const style = range.getTextStyle();
        if (run.bold)   style.setBold(true);
        if (run.italic) style.setItalic(true);
        if (run.code)   style.setFontFamily(CODE_FONT_FAMILY);
        if (run.link)   style.setLinkUrl(run.link);
      }
    }
    pos = runEnd;
  });
}

// ---- Tables ----

/**
 * Insert one table, fill its cells, and return the rendered height.
 */
function renderOneTable(gSlide, block, left, top, width, slideNum, tableIdx, warnings) {
  if (!block.rows || block.rows.length === 0) return 0;

  const rowCount = block.rows.length;
  const colCount = block.rows.reduce((max, r) => Math.max(max, r.length), 0);
  if (colCount === 0) return 0;

  const table = gSlide.insertTable(rowCount, colCount);
  try { table.setLeft(left); }   catch (e) { /* non-fatal */ }
  try { table.setTop(top); }     catch (e) { /* non-fatal */ }
  try { table.setWidth(width); } catch (e) { /* non-fatal */ }

  const cellSize = block.small ? TABLE_CELL_FONT_SIZE_SMALL_PT : TABLE_CELL_FONT_SIZE_PT;

  for (let r = 0; r < rowCount; r++) {
    const row = block.rows[r];
    for (let c = 0; c < colCount; c++) {
      if (c >= row.length) continue;
      try {
        const cellRuns = row[c] || [];
        const plainText = runsToText(cellRuns);
        const cell = table.getCell(r, c);
        const cellText = cell.getText();

        // Clear then set. Some Apps Script versions need explicit clear.
        cellText.setText(plainText);

        if (plainText.length > 0) {
          const whole = cellText.getRange(0, plainText.length);
          if (whole) {
            const style = whole.getTextStyle();
            style.setFontSize(cellSize);
            if (r === 0) style.setBold(true);
          }
          applyInlineRuns(cellText, 0, cellRuns);
        }
      } catch (e) {
        warnings.push('Slide ' + slideNum + ' table ' + tableIdx +
                      ' cell [' + r + ',' + c + ']: ' + e.message);
      }
    }
  }

  let h = 0;
  try { h = table.getHeight() || 0; } catch (e) { /* non-fatal */ }
  return h;
}

// ---- Images ----

/**
 * Insert one image, size it, position it, and return the rendered height.
 *
 * Sizing rules (in order of precedence):
 *   - widthPct   → maxWidth * (pct / 100), clamped to maxWidth
 *   - widthPx    → min(maxWidth, widthPx)
 *   - heightPx with no width directive → heightPx, derive width from aspect
 *   - otherwise  → maxWidth (fills the body area horizontally)
 *
 * Height is computed from the image's native aspect ratio, unless heightPx
 * is explicit. Images are centered horizontally within maxWidth so a
 * narrow figure does not hug the left margin.
 *
 * If insertImage fails (bad URL, fetch error, unsupported format), the
 * error is logged as a warning and the function returns 0 — the cursor
 * simply doesn't advance and the next block renders in place.
 */
function renderOneImage(gSlide, block, left, top, maxWidth, slideNum, idx, warnings) {
  let img;
  try {
    img = gSlide.insertImage(block.url);
  } catch (e) {
    warnings.push('Slide ' + slideNum + ' image ' + idx + ' (' + block.url +
                  '): insertImage failed — ' + e.message);
    return 0;
  }

  let nativeW = 0, nativeH = 0;
  try { nativeW = img.getWidth();  } catch (e) { /* non-fatal */ }
  try { nativeH = img.getHeight(); } catch (e) { /* non-fatal */ }
  const aspect = (nativeW > 0 && nativeH > 0) ? (nativeH / nativeW) : IMAGE_DEFAULT_ASPECT;

  let targetW = maxWidth;
  if (block.widthPct != null) {
    targetW = Math.min(maxWidth, maxWidth * (block.widthPct / 100));
  } else if (block.widthPx != null) {
    targetW = Math.min(maxWidth, block.widthPx);
  }
  let targetH = targetW * aspect;
  if (block.heightPx != null) {
    targetH = block.heightPx;
    if (block.widthPct == null && block.widthPx == null && aspect > 0) {
      // Height pinned, width free → derive width from aspect
      targetW = Math.min(maxWidth, block.heightPx / aspect);
    }
  }

  const imgLeft = left + (maxWidth - targetW) / 2;

  try { img.setLeft(imgLeft); }   catch (e) { /* non-fatal */ }
  try { img.setTop(top); }        catch (e) { /* non-fatal */ }
  try { img.setWidth(targetW); }  catch (e) { /* non-fatal */ }
  try { img.setHeight(targetH); } catch (e) { /* non-fatal */ }

  return targetH;
}
