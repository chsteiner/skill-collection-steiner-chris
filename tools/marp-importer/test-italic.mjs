// Quick check: does the italic regex correctly skip identifier-style underscores?

// Mirror of parseInline regex in Parser.gs. Keep in sync.
const pattern = new RegExp(
  '(\\*\\*\\*([^*]+?)\\*\\*\\*)' +
  '|(\\*\\*([^*]+?)\\*\\*)' +
  '|((?<![A-Za-z0-9])__([^_]+?)__(?![A-Za-z0-9]))' +
  '|(`([^`]+?)`)' +
  '|(\\[([^\\]]+)\\]\\(([^)]+)\\))' +
  '|((?<![A-Za-z0-9])\\*([^*\\n]+?)\\*(?![A-Za-z0-9]))' +
  '|((?<![A-Za-z0-9])_([^_\\n]+?)_(?![A-Za-z0-9]))',
  'g'
);

function findMatches(text) {
  const out = [];
  let m;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(text)) !== null) {
    out.push({ at: m.index, text: m[0], italic_u: m[14], italic_s: m[12], bold_u: m[5], bold_s: m[3] });
  }
  return out;
}

const cases = [
  { label: "plain identifier", text: "Use project_id column", expectItalicHits: 0 },
  { label: "two underscores in word", text: "source_of_truth is one entity", expectItalicHits: 0 },
  { label: "legit italic", text: "this is _important_ info", expectItalicHits: 1 },
  { label: "legit italic with surrounding id", text: "the project_id is _critical_ here", expectItalicHits: 1 },
  { label: "leading underscore var", text: "_private is a convention", expectItalicHits: 0 },
  { label: "trailing underscore var", text: "var_ is unusual", expectItalicHits: 0 },
  { label: "star italic", text: "this is *important* info", expectItalicHits: 1 },
  { label: "__bold__ with word boundary", text: "__bold__ word", expectBoldHits: 1 },
  { label: "__bold__ embedded in word", text: "a__b__c hack", expectBoldHits: 0, note: "word-boundary guards now protect __bold__ from matching inside identifier-like runs" },
  { label: "__bold__ mid-sentence", text: "this is __really__ important", expectBoldHits: 1 },
];

let fails = 0;
for (const c of cases) {
  const matches = findMatches(c.text);
  const italicHits = matches.filter(m => m.italic_u || m.italic_s).length;
  const boldHits = matches.filter(m => m.bold_u || m.bold_s).length;
  const iOK = c.expectItalicHits === undefined || italicHits === c.expectItalicHits;
  const bOK = c.expectBoldHits === undefined || boldHits === c.expectBoldHits;
  const ok = iOK && bOK;
  if (!ok) fails++;
  console.log(`${ok ? "OK " : "FAIL"}  ${c.label}`);
  console.log(`       text: "${c.text}"`);
  console.log(`       italic: ${italicHits}, bold: ${boldHits}  matches: ${JSON.stringify(matches.map(m => m.text))}`);
  if (c.note) console.log(`       note: ${c.note}`);
}

console.log(`\n${fails === 0 ? "All cases pass" : fails + " case(s) failed"}`);
process.exit(fails === 0 ? 0 : 1);
