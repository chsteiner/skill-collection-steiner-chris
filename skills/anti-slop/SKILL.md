---
name: anti-slop
description: "Removes the writing tells of Claude Opus 5.5, Claude Fable 5.1 and GPT-6 Astra (plus older Opus 4.x/5 and Fable 5 tells) in prose: over-formatting, contrast figures, slogan and comment-bait endings, announcement frames, mannered metaphor, invented specificity, triads, em dashes. Works two ways: as a silent self-check while generating reports, articles, emails, or documentation, and as an explicit audit of existing text. Covers English and German. Use whenever the user asks to 'check for slop', 'deslop' something, or 'anti-slop mode', and also whenever they say a text sounds AI-generated, robotic, generic, stiff, mannered, or 'like ChatGPT wrote it', want writing to 'sound human', or ask to cut cliches, filler, or empty phrases (German: Floskeln, leere Phrasen, klingt nach KI), even if they never say the word 'slop'. Also applies when generating prose deliverables longer than ~200 words. Not for code, commit messages, terminal output, structured data, or quick throwaway drafts."
---

# Anti-Slop

Calibrated for Claude Opus 5.5, Claude Fable 5.1 and GPT-6 Astra (September 2026). The tells have moved. Claude's old marker words (genuinely, quietly, honestly) and its em dashes have almost disappeared from Opus 5.5, while the structural and rhetorical habits have stayed: formatting where prose belongs, contrast figures, slogan endings, announcement frames, invented detail. Fable 5.1 adds a new failure, dense and mannered prose. GPT-6 Astra, by OpenAI's own account, still over-formats and reuses stock phrases. Each rule says which models it is measured or documented for (see Basis).

The master heuristic: look for clusters of patterns, not single hits. One contrast figure is writing; three of them plus a bold-lead scaffold plus a slogan ending is slop. (Exceptions: rules 6 and 8 are zero-tolerance for text you produce, and a contrast figure as the closing line is a finding on its own.)

## Modes

**Self-check**: silent, while generating prose deliverables over ~200 words (reports, articles, emails, blog posts, documentation prose). Apply the rules before output; don't show the check. Conversational chat replies are not deliverables; leave them out.

**Audit**: when the user says "check for slop" (diagnose only) or "deslop" (diagnose and rewrite). An explicit audit request always runs, even on text types the self-check skips (someone may well say "deslop this commit message"; do it). Reply in the user's language; quote passages verbatim in their original language.

Audit output format:

1. Findings as a numbered list: quoted passage (or a section reference for document-wide findings such as over-formatting or a buried lede), rule number, suggested fix, one line each. Group repeated hits of the same rule into one finding with a count and one or two examples.
2. For "deslop" only: the full rewritten text after the findings. Before you hand it over, reread the rewrite itself against rules 3 and 4: rewrites tend to keep a second contrast or to end on a new one ("It's better to X than to Y").
3. If the text is clean, say so in one sentence. Don't manufacture findings.

In both modes, fenced or inline code and verbatim quotations are exempt from all rules. The self-check also stays off for code, commit messages, terminal output, structured data, and quick drafts; "just a quick draft" from the user overrides it entirely.

## The rules

1. **Prose stays prose.** In emails, reports, blog posts, essays, and explanatory documentation: no headers, bullets, bold, tables, or `---` separators unless the user asked or the document type needs them (reference docs, runbooks, FAQs, a real comparison). Watch especially for numbered section headers in an essay ("## 1. Your audience stops being local"), bold-lead paragraphs (`**Use existing tools.** You don't need to build software...`), bold labels on every list item, and a "Bottom line" or "Fazit" heading on a blog post. Dissolve them into plain paragraphs. Still the strongest Claude tell: Opus 5.5 put headers into 12 of 15 English blog posts and bold into 55 of 60 English texts. It doesn't run the same way for every model, though. Anthropic says Fable 5.1 formats *less* than earlier models, and OpenAI says GPT-6 Astra formats *more*. So the rule is about fit, not a quota: don't flatten structure that the content really has (steps in order, parallel options, reference data).

2. **Break the triads.** Threes are the default scaffold: three reasons, three lessons, "First... Second... Third...", "Erstens... Zweitens... Drittens...", and summary sentences of the form "sichtbarer, vernetzter und effizienter". One triad may stay. For the rest, change the presentation, not the content: merge two points, run them as flowing argument, vary the scaffold. Never add or drop a substantive point just to escape the triad.

3. **Ration the contrast figure.** "not X, but Y" / "X, not Y" / "It isn't X. It's Y." / "This isn't about X. It's about Y." / "rather than" / "instead of" / "nicht X, sondern Y" / "kein X, sondern Y" / "nicht nur X, sondern auch Y". At most one per text, and never as the closing line; a contrast as the final sentence is a finding even if it's the only one. A variant to watch for is the unprompted alternative: naming what the text is *not* about, what you won't do, or what stays unchanged, when nobody asked. Measured in Opus 5.5 ("X, not Y" in 23 of 60 English texts; "nicht/kein ... sondern" in 16 of 60 German ones); OpenAI lists the same figures as GPT-6 Astra slop.

4. **End without a punchline.** No closing slogan or aphorism ("No agenda, no meeting." / "Unser Kalender wird es uns danken." / "Genau darin liegt heute oft der größte Mehrwert digitaler Projekte."), no German "Wer X, der Y" wisdom sentence, no summary closer ("In short," / "The bottom line" / "Kurz gesagt:" / "Unterm Strich"), no comment-bait question ("Share your experiences in the comments" / "Schreibt es gern in die Kommentare"), and no motivational or call-to-action ending where none belongs. End with the last piece of content. Measured: 14 of 15 English and 15 of 15 German Opus 5.5 blog posts end on a slogan, a comment-bait question, or a call to action (hand count); OpenAI names "Bottom Line:" and "In short:" for GPT-6 Astra.

5. **Cut announcement frames and hollow emphasis.** This covers colon reveals that stage a point instead of making it ("Die gute Nachricht: ..." / "Was wir am meisten unterschätzt haben: ..." / "Here's the thing:" / "The simplest mental model is:"), engineered scene openers of the form "Wer X, kennt das Problem:", question-as-transition fragments ("The result? Chaos." / "Das Ergebnis? Weniger Bugs."), single-sentence paragraphs placed for drama, and hedge transitions ("It's worth noting", "Importantly", "That said" / "Erwähnenswert ist", "Dabei gilt"). Marker words depend on the model generation. Opus 4.x and Opus 5 used genuinely, quietly, honestly, deliberately, load-bearing, worth noting; Opus 5.5 uses them far less ("genuinely" in 1 of 60 English texts, against 12 of 40 for Opus 5). German Claude text still leans on bewusst, genau, tatsächlich, spürbar. GPT-6 Astra (per OpenAI) leans on delve, foster, leverage, importantly, genuinely. Flag marker words only at three or more occurrences, or two in one paragraph; the other patterns follow the cluster heuristic.

6. **No invented specificity.** Models fabricate precise details as authenticity props: visitor counts, minutes, town sizes, inventory numbers, years. Measured in Opus 5.5 ("a town of 4,000 people", "38,000 people used our online collection from 41 countries", "Forty-five minutes later") as it was in Fable 5. In text you produce, never invent a number: if the fact isn't given, stay honestly general or mark the assumption. In rewrites of someone else's text, keep their factual claims unchanged and flag suspicious precision as a finding instead of silently generalizing it.

7. **Start with the point, not the frame.** No thesis-statement openers that bury the hook in paragraph three, no reflex scene or analogy openers ("Somewhere right now, a dozen people are sitting in a video call..." / "Imagine a restaurant..." / "Stellen Sie sich vor..." / "Viele Entwicklerteams kennen dieses Muster:"). Put the most concrete, newest information first.

8. **Em dashes: zero in text you produce or rewrite.** No em dash and no spaced en dash as a thought-dash, in both languages: use a colon, comma, parentheses, or a new sentence. In audits, list em-dash use as a finding (noting when it reads as deliberate authorial voice). Don't read dashes as proof of AI authorship: Opus 5.5 has nearly stopped using them (1 of 60 English texts, against 39 of 40 for Opus 5), so today they point to older models or to human writers as much as to current ones.

9. **Say it literally.** Mannered prose swaps a direct statement for a metaphor or flourish: "a dial worth turning" for "a parameter worth varying", "earns its keep" for "still matters", "load-bearing", "X wearing Y's clothing", "ist Gold wert", "öffnet die Tür zu". The same goes for coined compound labels presented as if they were established terms ("exact-head checks", "editorial-row layouts"). When a literal phrase is available, use it. Documented by Anthropic for Fable 5.1 and by OpenAI (compound labels) for GPT-6 Astra; "load-bearing" and the clothing metaphor are Opus 5 (developer logs), "Gold wert" and "öffnet die Tür" are Opus 5.5 (own corpus).

10. **Keep density readable.** Fable 5.1 can run long, packed sentences with few paragraph breaks (per Anthropic). Split sentences that carry more than one claim, and break paragraphs where the topic turns. This is the mirror image of the staccato guardrail below: vary length, don't pick a side.

## Guardrails: don't over-correct

- The cluster heuristic governs rules 1 to 5, 7, 9 and 10: one hit is not a finding. Rules 6 and 8 are the stated exceptions.
- Don't staccato. Cutting is good; three-word fragment chains are the same disease in reverse. Keep load-bearing connectors ("but", "because", "sondern" inside a real argument).
- Context decides. A postmortem may be structured, a README may use bullets, a real ranking may be a list. The rules target prose registers, not reference material. Stripping structure the content needs is a failure too.
- Author voice protects what is not on the rules list: slang, register mixing, long sentences, unusual metaphors, deliberate repetition. Human writers use contrast figures, dashes, and punchlines as well; a satirist's aphorism is not slop. Clustered rule patterns are still worth reporting in human-written text, but report them as observations and leave the call to the author. When unsure, keep it: a wrong cut damages the text, a missed one is just a missed fix.
- Translations and close paraphrases preserve the source's rhetorical patterns, including its triads and contrasts; deslop the rendering only if the user asks for that.
- Don't fake humanity. No manufactured casualness, typos, or slang to "sound human".

## Out of scope

GPT-era word lists (delve, tapestry, testament, landscape, journey) barely show up in Claude output: one "landscape" in 140 measured English Opus texts, none of the others. They are still relevant for GPT-6 Astra, whose vendor steering prompt still suppresses delve, foster and leverage, so check vocabulary when the text may come from an OpenAI model.

## Basis

Own cold-prompt corpus, September 2026: 280 texts from the same 40 prompts (20 English, 20 German; email, report, blog, documentation, misc registers), generated without style instructions: Opus 5.5 (120), Opus 5 (80), Opus 4.8 (80). Structural pattern counts and lexical over-representation against wordfreq; numbers above give texts with a hit over texts in that cell. Fable 5.1 and GPT-6 Astra were not measured here; their rules rest on Anthropic's "Prompting Claude Fable 5.1" guide (writing density, mannered prose, formatting in chat) and OpenAI's GPT-6 Astra prompting guide (slop-word and contrastive-framing list). Earlier basis, kept where it still holds: July 2026 corpus of Opus 4.x and Fable 5 (80 texts), EQ-Bench slop profiles, developer-log counts for Opus 5 (Matsuoka, August 2026).
