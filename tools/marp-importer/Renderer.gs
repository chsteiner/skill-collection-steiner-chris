/**
 * DHCraft Marp Import — Phase 4 complete (a + b + c)
 *
 * Body rendering:
 *   - paragraph, bulletList, numberedList, blockquote (Phase 4a)
 *   - codeBlock: monospace, smaller font (Phase 4b)
 *   - table: real Google Slides tables inserted below the body (Phase 4c)
 *   - small modifier on any block
 *   - two-column body splitting
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

// Table header fill (Google neutral grey #f1f3f4). Change to DHCraft brand
// color if desired: rgb values are 0..1, not 0..255.
const TABLE_HEADER_FILL_RGB = { red: 0.945, green: 0.953, blue: 0.961 };

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

  colorTableHeadersOnSlides(presentation, created, warnings);
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
 * Render a body area: text blocks go into the given shape, tables are
 * inserted as real Google Slides tables stacked below it.
 *
 * Special cases:
 *   - Body has no blocks at all: clear body text, return.
 *   - Body has only tables (no text blocks): remove body placeholder and
 *     place tables inside the body area.
 *   - Body has text + tables: shrink body to make room, tables below.
 *   - Body has only text: default behaviour.
 */
function renderBodyArea(gSlide, bodyShape, blocks, slideNum, warnings) {
  if (!blocks || blocks.length === 0) {
    bodyShape.getText().setText('');
    return;
  }
  const textBlocks = blocks.filter(b => b.kind !== 'table');
  const tables = blocks.filter(b => b.kind === 'table');

  const left = bodyShape.getLeft();
  const top = bodyShape.getTop();
  const width = bodyShape.getWidth();
  const height = bodyShape.getHeight();

  if (textBlocks.length === 0 && tables.length > 0) {
    // Tables only: remove body placeholder, put tables in its area
    try {
      bodyShape.getText().setText('');
      bodyShape.remove();
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': could not remove empty body: ' + e.message);
    }
    stackTablesAt(gSlide, tables, left, top, width, slideNum, warnings);
  } else if (tables.length > 0) {
    // Mixed: shrink body to ~40% of height, tables get the rest below
    const textHeight = height * 0.4;
    try { bodyShape.setHeight(textHeight); } catch (e) { /* non-fatal */ }
    renderBlocksIntoShape(bodyShape, textBlocks, slideNum, warnings);
    stackTablesAt(gSlide, tables, left, top + textHeight + TABLE_GAP_PT, width, slideNum, warnings);
  } else {
    // Text only
    renderBlocksIntoShape(bodyShape, textBlocks, slideNum, warnings);
  }
}

/**
 * Insert a stack of tables starting at the given top position, each
 * using the full provided width.
 */
function stackTablesAt(gSlide, tables, left, top, width, slideNum, warnings) {
  let cursorTop = top;
  tables.forEach((t, idx) => {
    try {
      const height = renderOneTable(gSlide, t, left, cursorTop, width, slideNum, idx, warnings);
      cursorTop += height + TABLE_GAP_PT;
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': table ' + idx + ' render error — ' + e.message);
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
  }
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

/**
 * Color the header row (row 0) of every table on the given slides.
 *
 * Rather than capturing table.getObjectId() during insertion (which can
 * return a proxy ID the Slides REST API does not recognize yet), this
 * walks the newly-created slides and reads each table's object ID at
 * flush time. By then SlidesApp has committed its mutations and the IDs
 * are valid server-side identifiers.
 *
 * A short sleep gives the backend extra time to propagate the inserts.
 */
function colorTableHeadersOnSlides(presentation, newSlides, warnings) {
  if (!newSlides || newSlides.length === 0) return;

  // Give SlidesApp time to commit server-side before we query via REST.
  Utilities.sleep(2000);

  const tables = [];
  newSlides.forEach(slide => {
    try {
      slide.getPageElements().forEach(el => {
        if (el.getPageElementType() === SlidesApp.PageElementType.TABLE) {
          tables.push(el.asTable());
        }
      });
    } catch (e) { /* non-fatal per-slide */ }
  });
  if (tables.length === 0) return;

  const requests = [];
  tables.forEach(table => {
    let colCount = 0;
    let tableId = null;
    try {
      colCount = table.getNumColumns();
      tableId = table.getObjectId();
    } catch (e) { /* skip this table */ }
    if (!tableId || colCount <= 0) return;

    for (let c = 0; c < colCount; c++) {
      requests.push({
        updateTableCellProperties: {
          objectId: tableId,
          tableRange: {
            location: { rowIndex: 0, columnIndex: c },
            rowSpan: 1,
            columnSpan: 1
          },
          tableCellProperties: {
            tableCellBackgroundFill: {
              solidFill: { color: { rgbColor: TABLE_HEADER_FILL_RGB } }
            }
          },
          fields: 'tableCellBackgroundFill.solidFill.color'
        }
      });
    }
  });

  if (requests.length === 0) return;
  console.log('Coloring ' + tables.length + ' table headers (' +
              requests.length + ' cell updates)');

  const presId = presentation.getId();
  const CHUNK = 50;
  for (let i = 0; i < requests.length; i += CHUNK) {
    const chunk = requests.slice(i, i + CHUNK);
    try {
      Slides.Presentations.batchUpdate({ requests: chunk }, presId);
    } catch (e) {
      warnings.push('Table header fill chunk ' + (i / CHUNK + 1) +
                    ' failed — ' + e.message);
    }
  }
}
