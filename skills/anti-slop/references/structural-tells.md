# Structural Tells

Tier 3: patterns that aren't words or phrases but shapes — formatting, rhythm, composition. These are language-independent and apply to English and German alike. They are also the *durable* tells: single-word markers fade as models adapt, structural ones stay.

## Contents

- [How to apply these](#how-to-apply-these)
- [Formatting](#formatting)
- [Chat artifacts](#chat-artifacts)
- [Rhythm](#rhythm)
- [Composition](#composition)

## How to apply these

The old version of this skill used numeric quotas ("max 1 per 300 words", "within 20% word count"). A language model can't compute those reliably — it estimates. So the rules below are **qualitative heuristics**: things you can actually judge by reading the text back. Where a number appears, it's a rough orientation for audits, not a count to calculate.

The general test for every structural tell: **read the passage back. If the pattern stands out as a pattern, it's a problem.**

## Formatting

| Pattern | Heuristic |
|---------|-----------|
| Over-formatting | The dominant Opus 4.7 regression. Bullets, headers, and bold reached for where flowing prose belongs. Anthropic's own system prompt forbids it: write reports, explanations, and documents in prose and paragraphs. Bullets are for genuinely enumerable items only. |
| Bullet lists for prose | If a list item is a full explanatory sentence or two, it wanted to be a paragraph. Convert. |
| Bold emphasis | Sparse. If more than one bold phrase is visible per screen of text, cut most. Bold every key term and nothing stands out. |
| Headers in short responses | No headers under ~200 words. If there are more headers than paragraphs, restructure. |
| Nested bullets | Two levels maximum. Deeper nesting means the content wanted to be prose or a table. |
| Inline-header bullet lists | `**Term:** description` repeated down a list is a strong AI tell. Use a real table, or write prose. |
| Curly / smart quotes mid-document | Inconsistent quote styles, or smart quotes in a plain-text context, often mark copy-paste from a chat window. |
| Title Case In Headings | Capitalizing Every Word in a heading is unnatural in both English and German. Use sentence case. |
| Markdown remnants | Stray asterisks, leftover `#`, skipped heading levels — signs of text moved between renderers. |

## Chat artifacts

Direct copy-paste traces from a chat interface. These are unambiguous — if you see one, the text came straight out of an LLM session and was never read:

- `oaicite`, `:contentReference[oaicite:...]`, `contentReference`
- `turn0search0`, `turn0news0` and similar `turnN...` tokens
- `utm_source=chatgpt.com` (or similar) inside URLs
- `attached_file`, `grok_card`, placeholder tokens like `[your name here]` left unfilled

## Rhythm

| Pattern | Heuristic |
|---------|-----------|
| Uniform sentence length | If several sentences in a row sound the same length when read aloud, vary them. LLM prose clusters tightly around medium-length sentences; human prose has a wider spread. |
| Staccato fragments | "Short. Punchy. Sentences." — always slop. Note: this is the over-correction trap of this very skill. Cutting words is good; cutting until everything is a fragment is the same disease. |
| Reflexive triplets / rule of three | Don't default to three examples, three reasons, three adjectives. Use the real number. Two is fine. Four is fine. One is often best. |
| Rhetorical question + immediate answer | "But why? Because..." — restructure as a statement. |
| Symmetric sections | Sections of near-identical length suggest template thinking. Real content is uneven. |
| Parallel sentence openings | Three or more sentences starting with the same word or structure — rewrite the openings. |
| Lemma repetition | Repeating the same content word across nearby sentences instead of varying or pronominalizing it. (Empirically the strongest structural tell in German — KONVENS 2024.) |

## Composition

| Pattern | Heuristic |
|---------|-----------|
| Copula avoidance | "serves as / stands as / boasts / features / represents / marks" used where plain "is / are" would do. A strong GPT and Gemini tell. Use the copula. |
| Present-participle tagging | Trailing "...highlighting its importance", "...reflecting a broader trend", "...underscoring the need" — pseudo-analysis bolted onto a sentence. Delete the tag, or make it a real clause with a real claim. |
| Negative parallelism | "It's not X, it's Y" and "no X, no Y, just Z" as a structural reflex. See the binary-contrast family in the language patterns files. |
| Importance inflation | "pivotal moment", "significant contribution", "transformative" — say what actually happened. |
| Section-header formulas | "Challenges and Legacy", "Future Outlook", "Broader Implications", "Impact" — generic header templates. Name the actual content. |
| Diplomatic balance | Don't present "both sides" unless asked. Take a position. |
| Manufactured enthusiasm | No exclamation marks in analytical writing. No "exciting", "powerful", "amazing" as default praise. |
| Premature summarizing | No "In conclusion" / "Zusammenfassend" unless the text is genuinely long (1000+ words). |
| Opening with known context | "In an era of rapid technological change..." / "In einer Zeit, in der..." — delete. Start with your point. |
| Unsolicited call to action | Delete a closing paragraph that's just encouragement or a next-step nobody asked for. |
| Listing qualifications before the answer | Answer first. Qualify after, if needed. |
| Descriptive instead of analytical | AI prose tends to *describe and restate*; human prose *argues and judges*. If a paragraph only summarizes without taking a position or drawing a conclusion, it may be padding. |

## A note on em-dashes

The old skill capped em-dashes at "1 per 300 words" as a universal rule. The reality is model-specific: GPT-4-class models overuse them heavily (around 9 per 1000 words, against a human baseline near 3); Claude Opus 4.7 already suppresses them (well under 1 per 1000). So:

- **Self-checking your own Opus 4.7 output:** em-dashes are not a likely problem. Don't hunt for them.
- **Auditing text from another model or unknown origin:** em-dash density *is* a useful tell. If they're noticeable when you read back, replace most with commas, colons, or parentheses.
- **Either way:** a writer who uses em-dashes deliberately and consistently is exercising style, not producing slop. The pattern to catch is the *reflexive* em-dash, not the considered one.
