/**
 * DHCraft Marp Import — Phase 2: Parser tests
 *
 * Each `test*` function is runnable from the Apps Script editor's
 * "Run" dropdown. Output goes to Executions → Logs.
 *
 * These are sanity checks, not a full test framework. They print the
 * parsed structure so you can eyeball it.
 */

function testParserMinimal() {
  const input =
    '# Hello\n' +
    '\n' +
    'A paragraph.\n';
  const result = parseMarkdown(input);
  console.log('--- testParserMinimal ---');
  console.log(JSON.stringify(result, null, 2));
}

function testParserAllTypes() {
  const input = [
    '---',
    'marp: true',
    'theme: default',
    '---',
    '',
    '<!-- _class: cover -->',
    '',
    '# Workshop Title',
    '',
    '## Subtitle line',
    '',
    '### Christian Steiner',
    '',
    '---',
    '',
    '# Section Heading',
    '',
    '---',
    '',
    '# Content Slide',
    '',
    'Intro paragraph with **bold** and *italic* and `code` and [a link](https://example.org).',
    '',
    '- First bullet',
    '- Second bullet',
    '  - Nested bullet',
    '  - Another nested',
    '- Third bullet',
    '',
    '1. Numbered',
    '2. Numbered again',
    '',
    '```python',
    'def hello():',
    '    return "world"',
    '```',
    '',
    '| A | B |',
    '|---|---|',
    '| 1 | **bold cell** |',
    '| 2 | [link](https://x.org) |',
    '',
    '> A blockquote, maybe with *italic*.',
    '',
    '<span class="small">Source: Author 2024. https://example.org</span>',
    '',
    '<!-- notes: Speak slowly here. -->',
    '',
    '---',
    '',
    '# Two Columns',
    '',
    '<div class="columns">',
    '<div>',
    '',
    '**Left**',
    '',
    '- a',
    '- b',
    '',
    '</div>',
    '<div>',
    '',
    '**Right**',
    '',
    '- c',
    '- d',
    '',
    '</div>',
    '</div>',
    '',
    '---',
    '',
    '<!-- _class: blank -->',
    ''
  ].join('\n');

  const result = parseMarkdown(input);
  console.log('--- testParserAllTypes ---');
  console.log('Slides:', result.slides.length);
  console.log('Warnings:', result.warnings.length);
  console.log(JSON.stringify(result, null, 2));
}

function testParserInline() {
  const cases = [
    'Plain text only.',
    '**bold** at start',
    'end with **bold**',
    'mixed **bold** and *italic* and `code`',
    '***bold italic*** combo',
    '[link text](https://example.org) inline',
    'multiple **bolds** in **one** line',
    'underscore _italic_ variant',
    'do not italicize snake_case_words'
  ];
  console.log('--- testParserInline ---');
  cases.forEach(c => {
    console.log('IN :', c);
    console.log('OUT:', JSON.stringify(parseInline(c)));
    console.log('');
  });
}

function testParserSmallBlock() {
  const input = [
    '# Glossary',
    '',
    '<div class="small">',
    '',
    '| Term | Meaning |',
    '|------|---------|',
    '| FAIR | Findable, Accessible, Interoperable, Reusable |',
    '| PID  | Persistent Identifier |',
    '',
    '</div>',
    '',
    'And a regular paragraph below.'
  ].join('\n');
  const result = parseMarkdown(input);
  console.log('--- testParserSmallBlock ---');
  console.log(JSON.stringify(result, null, 2));
}

function testParserWarnings() {
  const input = [
    '# Lone section',
    '',
    '---',
    '',
    '<!-- _class: cover -->',
    '',
    '# Title',
    '',
    'Extra paragraph that does not belong on a title slide.',
    '',
    '---',
    '',
    '# Section with subtitle',
    '',
    '## This subtitle should be dropped',
    '',
    '---',
    '',
    '# Content',
    '',
    '![dropped image](path/to/image.png)',
    '',
    '<div class="warn">',
    'This whole warn box should be dropped.',
    '</div>',
    '',
    'Normal paragraph.'
  ].join('\n');
  const result = parseMarkdown(input);
  console.log('--- testParserWarnings ---');
  console.log('Warnings:');
  result.warnings.forEach(w => console.log('  •', w));
  console.log('Slides:', JSON.stringify(result.slides, null, 2));
}

/**
 * Summary-only view of a parse result. Useful for large real-world files
 * where the full JSON would flood the log.
 */
function summarizeParseResult(result) {
  const counts = {};
  result.slides.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
  const parts = Object.keys(counts).sort().map(k => counts[k] + ' ' + k);
  return 'Slides: ' + result.slides.length + ' (' + parts.join(', ') + '). ' +
         'Warnings: ' + result.warnings.length + '.';
}
