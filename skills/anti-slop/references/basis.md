# Basis of the anti-slop rules

Where the rules come from, with model versions and dates. The rules in `SKILL.md` name model families only. Versions belong here, next to the measurement they describe.

## Own cold-prompt corpus

The same 40 prompts (20 English, 20 German: email, report, blog, documentation, misc), no style instructions, neutral system prompt, generated through `claude -p`. Cells count texts with at least one hit over texts in the cell. Chat framing before and after the deliverable is cut before counting.

| Tell | Opus 4.8 | Opus 5 | Opus 5.5 | Fable 5.2 |
|---|---|---|---|---|
| Em dash (EN) | 35/40 | 39/40 | 1/60 | 0/60 |
| Spaced en dash ` – ` (DE) | 36/40 | 31/40 | 9/60 | 4/60 |
| Markdown header (EN) | 30/40 | 29/40 | 34/60 | 36/60 |
| Bullet with bold label (EN) | 20/40 | 19/40 | 38/60 | 37/60 |
| Bold-lead paragraph (EN) | 7/40 | 21/40 | 13/60 | 12/60 |
| "X, not Y" (EN) | 13/40 | 18/40 | 23/60 | 19/60 |
| "nicht/kein ... sondern" (DE) | 12/40 | 21/40 | 16/60 | 15/60 |
| "Wer X, der Y" (DE) | 8/40 | 11/40 | 18/60 | 20/60 |
| Colon reveal (DE) | 11/40 | 19/40 | 24/60 | 16/60 |
| Announced importance, "this matters" and similar (EN) | 3/40 | 7/40 | 10/60 | 7/60 |
| Summary closer phrase, "in short" and similar (EN) | 7/40 | 0/40 | 13/60 | 5/60 |
| Semicolon (EN) | 13/40 | 27/40 | 11/60 | 16/60 |
| Semicolon (DE) | 6/40 | 17/40 | 1/60 | 15/60 |
| "genuinely" (EN) | 4/40 | 12/40 | 1/60 | 0/60 |
| "quietly" (EN) | 10/40 | 10/40 | 6/60 | 2/60 |
| Any form of "tragen", literal uses included (DE) | 0/40 | 3/40 | 1/60 | 1/60 |

Opus 4.8, 5 and 5.5: September 2026 (80, 80 and 120 texts). Fable 5.2: November 2026 (120 texts, 3 per prompt). Fable 5.1 was not measured. The counts are regex-based and were spot-checked for false hits. "X, not Y" also hits table cells. Blog endings were classified by hand for Opus 5.5 only: every one of 9 English and 9 German blog posts outside company and LinkedIn posts ended on a slogan, a comment-bait question or a call to action. GPT-era vocabulary (delve, tapestry, testament, journey, leverage, foster) occurs once in the 200 English texts (40 + 40 + 60 + 60): "journey", in one Fable 5.2 text. "load-bearing" and "worth noting" occur in none of them. Against a wordfreq baseline, German Fable 5.2 over-uses "benennen" (about 50x, 7 hits in 6 prompts).

An earlier corpus of the same design, July 2026, covered Opus 4.x and Fable 5 (80 texts). It supplied the original rules 1 to 8.

Measured side effect of the skill itself (September 2026, Opus 5.5 with the skill loaded, 16 held-out prompts): English prose paragraphs grew from 39 to 58 words on average. That is why the guardrails ask for splits. The November 2026 version shows the same effect (Opus 5.5 English 39 to 61 words, Fable 5.2 English 39 to 48, 16 held-out prompts × 2 each).

## Evaluation of this version (November 2026)

Audit of six held-out texts, 3 runs each, judge Claude Sonnet 5, rubrics written before the revision: Opus 5.5 117 of 117 criteria, Fable 5.2 115 of 117. Both misses are on a human-written German control text, where Fable 5.2 treated a colon that introduces an explanation as an announcement frame in 2 of 3 runs. Self-check, 16 held-out prompts × 2 per language, texts with a hit, without skill and with it: bullets with a bold label 15/16 to 0/16 (Opus 5.5, English) and 11/16 to 1/16 (Fable 5.2, English), "X, not Y" 5/16 and 3/16 to 0/16, semicolons in German Fable 5.2 text 7/16 to 0/16, headers 12/16 to 5/16 (Opus 5.5) and 8/16 (Fable 5.2, English).

## The German "tragen" case of rule 9

User observation on Opus-drafted German prose, November 2026, plus a count in a private German rules-and-docs repository drafted with Opus 5 and 5.5 (per commit co-author lines): 92 occurrences of "tragen" forms in 35,515 words (2.6 per 1,000) against a wordfreq baseline of 0.28 per 1,000 for the same forms, about 9x. Not a cold-prompt measurement, and the count does not separate literal from metaphorical uses. In the cold-prompt corpus above the word is rare (1 of 60 German texts for Opus 5.5 and for Fable 5.2), so the tic shows in long working prose, not in short commissioned texts. The marker words are German counterparts of entries in English Claude tic lists found in November 2026 (archiewood/claudeisms, claudisms.ai, smixs/awesome-claude-output-styles), whose methods were not checked here. Four German forms were counted in the same repository against wordfreq with a word-token count: benennen about 15x, hängen about 9x (all forms, not only "hängt an"), entscheiden about 8x, Urteil about 4x. "leisten" is not over-represented there (about 0.6x) and the phrase "leistet die Arbeit" does not occur, so it is not on the list. The repository is about measurement ("gemessen" itself about 150x), so part of these factors is topic, which is why they are markers and not zero-tolerance.

## Vendor and third-party measurements of Opus 5.5

All three are companies with products in AI-text detection or evaluation, and some of their judges are themselves Claude models. Read on 18.11.2026 at the pages named.

- **Graphite, "AI Tells: Opus 5.5 Update" (2026):** articles on 9,974 topics rewritten from summaries, compared with human articles written before ChatGPT. Times the human rate: "this matters" 116x, "is more than a _ it" 98x, "why _ matters" 92x, "rather than simply" 32x. Em dashes 2.92 per 1,000 words in Opus 5, 0.015 in Opus 5.5. Mannered-prose score (Anthropic's definition, 1,000-topic subsample) 16.75 for Opus 5, 10.57 for Opus 5.5, 6.65 for human articles. Word, phrase and frame tells: 2,666 in Opus 5, 2,548 in Opus 5.5. https://graphite.io/five-percent/research/ai-tells-opus-5-5-update
- **Arize, "Anthropic says it fixed Claude's writing" (September 2026):** 80 blog posts from 20 frozen briefs, 153 human flags on Opus 5, then an LLM span judge. "Claudisms" per 1,000 words fall from 4.79 (Opus 5) to 2.38 (Opus 5.5), every category down (announced importance 1.67 to 0.93). A simple scan found about 2.5 times as many bold lead-in bullets, 35% more three-part lists, and 8% more length in Opus 5.5. https://arize.com/blog/anthropic-says-it-fixed-claudes-writing/
- **Pangram, "Can Pangram detect Opus 5.5?":** 1,000 Chatbot Arena prompts answered by Opus 5.5, Opus 5 and Sonnet 5 (3,000 responses, 1,618,289 words). Per 1,000 words, Opus 5 to Opus 5.5: summarization markers 0.016 to 0.171, unordered bullet items 7.36 to 13.63, caveat and uncertainty markers 5.48 to 6.74, mean sentence length 14.53 to 12.50 words, negations 10.52 to 7.53. "in short" 9 to 100 uses, "genuinely" 83% fewer, "the honest answer" not at all. https://www.pangram.com/blog/can-pangram-detect-opus-5-5

## Anthropic's own documentation

- **Prompting guides** (platform.claude.com, build-with-claude/prompt-engineering): Fable 5 can compress long-run reports into "arrow chains", "hyphen-stacked compounds" and "labels you made up earlier". Fable 5.1 "uses bold less and is less likely to reach for headers, lists, or quotation marks", has "few stock phrases", writes denser prose in some cases, and its summaries can reproduce source wording without marking it as a quotation. The same guide defines mannered prose ("a dial worth turning", "this point earns its keep") and ends: "When a literal phrase is available, use it." Fable 5.2: a prompt for readable reports made them "less dense and reduced the number of semicolons", contains "Do not use a term or abbreviation that you made up during the work", and hard style limits such as "one instruction per sentence, in 20 words or fewer" can make its prose "choppy". The Fable 5 guide warns that skills written for earlier models "are often too prescriptive". The best-practices page notes that on Fable 5.1 an anti-formatting block "can suppress structure the content needs". In the corpus above, Fable 5.2 formats about as much as Opus 5.5 under a neutral system prompt.
- **claude.ai system prompts** (platform.claude.com, release-notes/system-prompts): the Opus 5 prompt bans "genuinely", "honestly" and "straightforward" and lists mannered devices to avoid: "asides set off by em-dashes, "not X, but Y" framing, colon-then-reveal sentences, scare quotes around invented labels, and stock phrases such as "worth noting" or "honest caveat"". The Opus 5.5 and Fable 5.2 prompts carry neither list. Both keep a block against over-formatting.

## Gaps

No published measurement of German prose by any of these models was found in November 2026. The German numbers above are the only ones known here. Fable 5.1 was not measured, and Fable 5.2 only through the cold-prompt corpus. The density and coined-label tells of rule 10 are documented by Anthropic for reports after long agentic work and are not measured here.
