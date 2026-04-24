/**
 * DHCraft Marp Import — Phase 2: Parser
 *
 * Converts a markdown string into a structured slide tree according to
 * the locked contract:
 *
 *   - YAML frontmatter at the top is stripped
 *   - `---` on its own line separates slides (not inside code fences)
 *   - Slide type:
 *       <!-- _class: cover --> → title
 *       <!-- _class: blank --> → blank
 *       body contains <div class="columns"> → twocolumn
 *       lone # or ## heading with no body → section
 *       otherwise → content
 *   - Title slide: # H1, optional ## H2 (subtitle), optional ### H3 (author)
 *   - Section slide: # H1 only (## also accepted). ## as subtitle is dropped.
 *   - Content slide: # H1 preferred, ## accepted as fallback title with warning
 *   - Content/twocolumn body blocks: paragraph, bulletList, numberedList,
 *     codeBlock, table, blockquote, image
 *   - Small-text modifier via <small>...</small>, <span class="small">,
 *     or <div class="small">
 *   - Speaker notes via <!-- notes: ... --> anywhere in the slide
 *   - Inline formatting: **bold**, *italic*, `code`, [text](url)
 *   - Images ![](url): remote URLs rendered inline with optional Marp
 *     size directives (width:XX%, height:XXpx); relative paths dropped
 *     with a warning
 *
 * Returns { slides, warnings }.
 */

/**
 * Entry point.
 * @param {string} text - raw markdown.
 * @return {{slides: object[], warnings: string[]}}
 */
function parseMarkdown(text) {
  const warnings = [];
  const stripped = stripFrontmatter(text);
  const blocks = splitSlides(stripped);
  const slides = [];

  blocks.forEach((block, i) => {
    const slideNum = i + 1;
    try {
      const slide = parseSlide(block, slideNum, warnings);
      if (slide) slides.push(slide);
    } catch (e) {
      warnings.push('Slide ' + slideNum + ': parse error — ' + e.message);
    }
  });

  return { slides: slides, warnings: warnings };
}

/**
 * Strip YAML frontmatter if the file starts with `---` on line 1.
 */
function stripFrontmatter(text) {
  const lines = text.split('\n');
  if (lines.length === 0 || lines[0].trim() !== '---') return text;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      return lines.slice(i + 1).join('\n');
    }
  }
  // No closing fence — treat as no frontmatter
  return text;
}

/**
 * Split markdown into slide blocks. `---` on its own line is a separator
 * unless it's inside a fenced code block.
 */
function splitSlides(text) {
  const lines = text.split('\n');
  const blocks = [];
  let current = [];
  let inCodeFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      inCodeFence = !inCodeFence;
    }
    if (!inCodeFence && trimmed === '---') {
      if (current.some(l => l.trim() !== '')) {
        blocks.push(current.join('\n'));
      }
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.some(l => l.trim() !== '')) {
    blocks.push(current.join('\n'));
  }
  return blocks;
}

/**
 * Parse a single slide block into a structured slide object.
 */
function parseSlide(text, slideNum, warnings) {
  const slide = { type: null, notes: '' };

  // Extract notes (multi-line tolerant). Keep only the first one if multiple.
  const notesMatches = [...text.matchAll(/<!--\s*notes:([\s\S]*?)-->/g)];
  if (notesMatches.length > 0) {
    slide.notes = notesMatches[0][1].trim();
    if (notesMatches.length > 1) {
      warnings.push('Slide ' + slideNum + ': multiple notes blocks, only the first kept');
    }
  }
  text = text.replace(/<!--\s*notes:[\s\S]*?-->/g, '');

  // Extract class directive
  const classMatch = /<!--\s*_class:\s*(\w+)\s*-->/.exec(text);
  const className = classMatch ? classMatch[1].toLowerCase() : null;
  text = text.replace(/<!--\s*_class:\s*\w+\s*-->/g, '');

  // Strip any other HTML comments (except the structural <div>/<span> we handle)
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Determine slide type
  if (className === 'cover') {
    slide.type = 'title';
  } else if (className === 'blank') {
    slide.type = 'blank';
    return slide;
  } else if (className) {
    warnings.push('Slide ' + slideNum + ': unknown _class "' + className + '", treating as content');
    slide.type = 'content';
  } else if (/<div class="columns">/.test(text)) {
    slide.type = 'twocolumn';
  } else if (isLoneHeading(text)) {
    slide.type = 'section';
  } else {
    slide.type = 'content';
  }

  switch (slide.type) {
    case 'title':     return parseTitleSlide(text, slide, slideNum, warnings);
    case 'section':   return parseSectionSlide(text, slide, slideNum, warnings);
    case 'content':   return parseContentSlide(text, slide, slideNum, warnings);
    case 'twocolumn': return parseTwoColumnSlide(text, slide, slideNum, warnings);
    default:          return slide;
  }
}

/**
 * A slide is a "section" if its only non-empty content is a single
 * # H1 or ## H2 heading. External decks often use ## as the slide title
 * — we accept both so those slides still register as sections (and not
 * as titleless content slides).
 */
function isLoneHeading(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l !== '');
  if (lines.length !== 1) return false;
  return /^#{1,2}\s+\S/.test(lines[0]) && !/^###/.test(lines[0]);
}

function parseTitleSlide(text, slide, slideNum, warnings) {
  slide.title = '';
  slide.subtitle = '';
  slide.author = '';
  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
  for (const line of lines) {
    const h3 = /^###\s+(.+)$/.exec(line);
    const h2 = /^##\s+(.+)$/.exec(line);
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h3)       slide.author = h3[1];
    else if (h2)  slide.subtitle = h2[1];
    else if (h1)  slide.title = h1[1];
    else if (!/^<(div|span|\/)/.test(line)) {
      warnings.push('Slide ' + slideNum + ' (title): extra content ignored: "' +
                    line.slice(0, 60) + (line.length > 60 ? '…' : '') + '"');
    }
  }
  if (!slide.title) {
    warnings.push('Slide ' + slideNum + ' (title): no # H1 found');
  }
  return slide;
}

function parseSectionSlide(text, slide, slideNum, warnings) {
  // Accept either # H1 or ## H2 as the section title. If both are present,
  // # takes precedence and ## is dropped with a warning (section slides
  // don't support a subtitle in the dh-section layout).
  const h1 = /^#\s+(.+)$/m.exec(text);
  if (h1) {
    slide.title = h1[1].trim();
    if (/^##\s/m.test(text)) {
      warnings.push('Slide ' + slideNum + ' (section): ## subtitle dropped (section slides have no subtitle)');
    }
  } else {
    const h2 = /^##\s+(.+)$/m.exec(text);
    slide.title = h2 ? h2[1].trim() : '';
  }
  return slide;
}

function parseContentSlide(text, slide, slideNum, warnings) {
  const { title, bodyText, titleLevel } = extractTitle(text);
  slide.title = title;
  if (!title) {
    warnings.push('Slide ' + slideNum + ' (content): no # or ## heading found');
  } else if (titleLevel === 2) {
    warnings.push('Slide ' + slideNum + ' (content): ## used as slide title (prefer # H1); tolerant fallback applied');
  }
  slide.body = parseBody(bodyText, slideNum, warnings);
  return slide;
}

function parseTwoColumnSlide(text, slide, slideNum, warnings) {
  const { title, bodyText } = extractTitle(text);
  slide.title = title;
  slide.columns = [[], []];

  const lines = bodyText.split('\n');

  // Find the opening <div class="columns"> line
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/<div class="columns">/.test(lines[i])) { startIdx = i; break; }
  }
  if (startIdx === -1) {
    warnings.push('Slide ' + slideNum + ' (twocolumn): no <div class="columns"> found');
    return slide;
  }

  // Depth-track <div>/</div> to collect two inner columns.
  // Depth 1 = inside class="columns"; depth 2 = inside a column.
  const cols = [];
  let colLines = null;
  let depth = 1;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '<div>' && depth === 1) {
      depth = 2;
      colLines = [];
      continue;
    }
    if (t === '</div>') {
      if (depth === 2) {
        cols.push(colLines.join('\n'));
        colLines = null;
        depth = 1;
      } else if (depth === 1) {
        break; // closing the columns wrapper
      }
      continue;
    }
    if (depth === 2) colLines.push(lines[i]);
    // Anything at depth 1 between columns is stray; ignore.
  }

  if (cols.length !== 2) {
    warnings.push('Slide ' + slideNum + ' (twocolumn): expected 2 columns, found ' +
                  cols.length);
    while (cols.length < 2) cols.push('');
  }

  slide.columns = [
    parseBody(cols[0], slideNum, warnings),
    parseBody(cols[1], slideNum, warnings)
  ];
  return slide;
}

/**
 * Find the slide title and return { title, bodyText, titleLevel }.
 * titleLevel is 1 (found # H1), 2 (fallback to ## H2), or 0 (no heading).
 *
 * The ## fallback is tolerant of external decks authored for vanilla Marp,
 * where ## is often used as the slide title. The caller (parseContentSlide)
 * emits a warning when the fallback fires, so authors notice they're not
 * following the DHCraft contract — but the slide still gets a title.
 */
function extractTitle(text) {
  const lines = text.split('\n');
  // Prefer a # H1
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^#\s+\S/.test(t) && !/^##/.test(t)) {
      return {
        title: t.replace(/^#\s+/, ''),
        bodyText: lines.slice(i + 1).join('\n'),
        titleLevel: 1
      };
    }
  }
  // Fallback: first ## H2 acts as title
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^##\s+\S/.test(t) && !/^###/.test(t)) {
      return {
        title: t.replace(/^##\s+/, ''),
        bodyText: lines.slice(i + 1).join('\n'),
        titleLevel: 2
      };
    }
  }
  return { title: '', bodyText: text, titleLevel: 0 };
}

/**
 * Parse a body region into an array of block objects.
 */
function parseBody(text, slideNum, warnings) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;
  let smallContext = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') { i++; continue; }

    // Image: ![alt-with-optional-size-directives](url)
    // Remote URLs (http/https) are inserted into the slide. Relative paths
    // are dropped with a warning — the Apps Script runtime can't resolve
    // local paths from the author's filesystem. Marp size directives
    // (width:XX%, width:XXpx, height:XXpx, with w:/h: short forms) are
    // parsed out of the alt text.
    if (/^!\[/.test(trimmed)) {
      const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(trimmed);
      if (!imgMatch) {
        warnings.push('Slide ' + slideNum + ': malformed image syntax — dropped ("' +
                      trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : '') + '")');
        i++; continue;
      }
      const alt = imgMatch[1];
      const url = imgMatch[2].trim();
      if (!/^https?:\/\//i.test(url)) {
        warnings.push('Slide ' + slideNum + ': image with relative path dropped (' +
                      url + ') — host it publicly and use a full URL');
        i++; continue;
      }
      const widthPctM  = /(?:^|\s)(?:width|w):(\d+)%(?:\s|$)/.exec(alt);
      const widthPxM   = /(?:^|\s)(?:width|w):(\d+)px(?:\s|$)/.exec(alt);
      const heightPxM  = /(?:^|\s)(?:height|h):(\d+)px(?:\s|$)/.exec(alt);
      blocks.push({
        kind: 'image',
        url: url,
        alt: alt,
        widthPct: widthPctM ? parseInt(widthPctM[1], 10) : null,
        widthPx:  widthPxM  ? parseInt(widthPxM[1],  10) : null,
        heightPx: heightPxM ? parseInt(heightPxM[1], 10) : null,
        small: smallContext
      });
      i++; continue;
    }

    // <div class="small"> opens a small context
    if (/^<div class="small">/.test(trimmed)) {
      smallContext = true;
      i++; continue;
    }
    // </div> closes the small context (only if we opened one)
    if (smallContext && /^<\/div>\s*$/.test(trimmed)) {
      smallContext = false;
      i++; continue;
    }

    // Whole-line <span class="small">...</span> → small paragraph
    const spanOne = /^<span class="small">([\s\S]*?)<\/span>\s*$/.exec(trimmed);
    if (spanOne) {
      blocks.push({ kind: 'paragraph', runs: parseInline(spanOne[1]), small: true });
      i++; continue;
    }

    // Whole-line <small>...</small> → small paragraph (standard HTML form)
    const smallOne = /^<small>([\s\S]*?)<\/small>\s*$/.exec(trimmed);
    if (smallOne) {
      blocks.push({ kind: 'paragraph', runs: parseInline(smallOne[1]), small: true });
      i++; continue;
    }

    // <div class="warn"> and other unknown wrappers: drop with warning, scan until matching </div>
    const unknownDiv = /^<div(\s[^>]*)?>/.exec(trimmed);
    if (unknownDiv && !/<div class="columns">/.test(trimmed) && !/<div class="small">/.test(trimmed) && trimmed !== '<div>') {
      warnings.push('Slide ' + slideNum + ': unsupported <div> dropped (' + trimmed.slice(0, 50) + ')');
      // Skip until </div> at the same nesting
      let depth = 1;
      i++;
      while (i < lines.length && depth > 0) {
        if (/<div[\s>]/.test(lines[i])) depth++;
        if (/<\/div>/.test(lines[i])) depth--;
        i++;
      }
      continue;
    }

    // Fenced code block
    if (/^```/.test(trimmed)) {
      const lang = trimmed.replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      blocks.push({
        kind: 'codeBlock',
        text: codeLines.join('\n'),
        language: lang,
        small: smallContext
      });
      continue;
    }

    // Table: line starts with `|` and next line is a separator row
    if (/^\|/.test(trimmed)) {
      const result = parseTable(lines, i, smallContext);
      if (result) {
        blocks.push(result.block);
        i += result.consumed;
        continue;
      }
      // Fall through to paragraph if not actually a table
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        kind: 'blockquote',
        runs: parseInline(quoteLines.join(' ')),
        small: smallContext
      });
      continue;
    }

    // Bullet list
    if (/^\s*[-*+]\s+/.test(line)) {
      const result = parseBulletList(lines, i, smallContext);
      blocks.push(result.block);
      i += result.consumed;
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const result = parseNumberedList(lines, i, smallContext);
      blocks.push(result.block);
      i += result.consumed;
      continue;
    }

    // Unexpected headings inside a body (e.g., stray ## on a section slide or
    // content slide). Drop with a warning rather than getting stuck.
    if (/^#{1,6}\s/.test(trimmed)) {
      warnings.push('Slide ' + slideNum + ': heading inside body ignored: "' +
                    trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : '') + '"');
      i++; continue;
    }

    // Paragraph: collect consecutive non-empty, non-structural lines
    const paraStart = i;
    const paraLines = [];
    while (i < lines.length) {
      const l = lines[i];
      const t = l.trim();
      if (t === '') break;
      if (/^(#|>|\||```)/.test(t)) break;
      if (/^\s*[-*+]\s+/.test(l)) break;
      if (/^\s*\d+\.\s+/.test(l)) break;
      if (/^<(div|\/div|span class="small"|small|\/small)/.test(t)) break;
      if (/^!\[/.test(t)) break;
      paraLines.push(t);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({
        kind: 'paragraph',
        runs: parseInline(paraLines.join(' ')),
        small: smallContext
      });
    } else {
      // Safety: if nothing was consumed, skip this line and warn. Prevents
      // infinite loops on unexpected input.
      warnings.push('Slide ' + slideNum + ': unrecognized line skipped: "' +
                    lines[paraStart].trim().slice(0, 60) + '"');
      i = paraStart + 1;
    }
  }

  return blocks;
}

function parseTable(lines, start, small) {
  const header = lines[start].trim();
  if (!/^\|.*\|?\s*$/.test(header)) return null;
  if (start + 1 >= lines.length) return null;
  const sep = lines[start + 1].trim();
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(sep)) return null;

  const rows = [];
  rows.push(parseTableRow(header));

  let i = start + 2;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!/^\|/.test(t)) break;
    rows.push(parseTableRow(t));
    i++;
  }
  return {
    block: { kind: 'table', rows: rows, small: small },
    consumed: i - start
  };
}

function parseTableRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map(cell => parseInline(cell.trim()));
}

function parseBulletList(lines, start, small) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const m = /^(\s*)[-*+]\s+(.*)$/.exec(lines[i]);
    if (!m) break;
    const indent = m[1].replace(/\t/g, '  ').length;
    items.push({ level: Math.floor(indent / 2), runs: parseInline(m[2]) });
    i++;
  }
  return {
    block: { kind: 'bulletList', items: items, small: small },
    consumed: i - start
  };
}

function parseNumberedList(lines, start, small) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const m = /^(\s*)\d+\.\s+(.*)$/.exec(lines[i]);
    if (!m) break;
    const indent = m[1].replace(/\t/g, '  ').length;
    items.push({ level: Math.floor(indent / 3), runs: parseInline(m[2]) });
    i++;
  }
  return {
    block: { kind: 'numberedList', items: items, small: small },
    consumed: i - start
  };
}

/**
 * Parse inline markdown formatting into an array of text runs.
 * Run shape: { text, bold?, italic?, code?, link? }
 *
 * Handles: ***bold italic***, **bold**, __bold__, `code`, [text](url),
 *          *italic*, _italic_
 *
 * Underscore-delimited patterns (__bold__, _italic_) use word-boundary
 * guards so identifiers like `project_id` and `source_of_truth` are NOT
 * treated as emphasis in prose. Asterisk patterns likewise protect *italic*
 * from being matched inside word runs.
 */
function parseInline(text) {
  if (!text) return [];

  const runs = [];
  // Alternatives in order of precedence. First match wins at each position.
  const pattern = new RegExp(
    '(\\*\\*\\*([^*]+?)\\*\\*\\*)' +        // ***bold italic***
    '|(\\*\\*([^*]+?)\\*\\*)' +             // **bold**
    '|((?<![A-Za-z0-9])__([^_]+?)__(?![A-Za-z0-9]))' +       // __bold__
    '|(`([^`]+?)`)' +                       // `code`
    '|(\\[([^\\]]+)\\]\\(([^)]+)\\))' +     // [text](url)
    '|((?<![A-Za-z0-9])\\*([^*\\n]+?)\\*(?![A-Za-z0-9]))' +  // *italic*
    '|((?<![A-Za-z0-9])_([^_\\n]+?)_(?![A-Za-z0-9]))',       // _italic_
    'g'
  );

  let lastEnd = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastEnd) {
      runs.push({ text: text.slice(lastEnd, m.index) });
    }
    if (m[1])       runs.push({ text: m[2], bold: true, italic: true });
    else if (m[3])  runs.push({ text: m[4], bold: true });
    else if (m[5])  runs.push({ text: m[6], bold: true });
    else if (m[7])  runs.push({ text: m[8], code: true });
    else if (m[9])  runs.push({ text: m[10], link: m[11] });
    else if (m[12]) runs.push({ text: m[13], italic: true });
    else if (m[14]) runs.push({ text: m[15], italic: true });
    lastEnd = m.index + m[0].length;
  }
  if (lastEnd < text.length) {
    runs.push({ text: text.slice(lastEnd) });
  }
  if (runs.length === 0) {
    runs.push({ text: text });
  }
  return runs;
}
