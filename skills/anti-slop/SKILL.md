---
name: anti-slop
description: "Removes the writing tells of Claude Opus 5.5, Claude Fable 5.1 and GPT-6 Astra (plus older Opus 4.x/5 and Fable 5 tells) in prose: over-formatting, contrast figures, slogan and comment-bait endings, announcement frames, mannered metaphor, invented specificity, triads, em dashes. Works two ways: as a silent self-check while generating reports, articles, emails, or documentation, and as an explicit audit of existing text. Covers English and German. Use whenever the user asks to 'check for slop', 'deslop' something, or 'anti-slop mode', and also whenever they say a text sounds AI-generated, robotic, generic, stiff, mannered, or 'like ChatGPT wrote it', want writing to 'sound human', or ask to cut cliches, filler, or empty phrases (German: Floskeln, leere Phrasen, klingt nach KI), even if they never say the word 'slop'. Also applies when generating prose deliverables longer than ~200 words. Not for code, commit messages, terminal output, structured data, or quick throwaway drafts."
---

# Anti-Slop

Calibrated for Claude Opus 5.5, Claude Fable 5.1 and GPT-6 Astra (September 2026). In Claude's own output the old marker words and the em dashes have largely gone; formatting where prose belongs, contrast figures, slogan endings, announcement frames and invented detail have stayed. Anthropic reports that Fable 5.1 can write denser prose and recommends steering it away from mannered prose; OpenAI reports that GPT-6 Astra tends toward heavily formatted answers and recurring phrases. Sources are in Basis.

The master heuristic: look for clusters of patterns, not single hits. One contrast figure is writing; three of them plus a bold-lead scaffold plus a slogan ending is slop. Exceptions: rules 6 and 8 are zero-tolerance for text you produce, and the closing line (rules 3 and 4) is a finding on its own.

## Modes

**Self-check**: silent, while generating prose deliverables over ~200 words (reports, articles, emails, blog posts, documentation prose). Apply the rules before output; don't show the check. Conversational chat replies are not deliverables; leave them out.

**Audit**: when the user says "check for slop" (diagnose only) or "deslop" (diagnose and rewrite). An explicit audit request always runs, even on text types the self-check skips (someone may well say "deslop this commit message"; do it). Reply in the user's language; quote passages verbatim in their original language.

Audit output format:

1. Findings as a numbered list: quoted passage (or a section reference for document-wide findings such as over-formatting or a buried lede), rule number, suggested fix, one line each. Group repeated hits of the same rule into one finding with a count and one or two examples.
2. For "deslop" only: the full rewritten text after the findings. Before you hand it over, reread the rewrite itself against rules 3 and 4: rewrites tend to keep a second contrast or to end on a new one.
3. If the text is clean, say so in one sentence. Don't manufacture findings.

In both modes, fenced or inline code and verbatim quotations are exempt from all rules. The self-check also stays off for code, commit messages, terminal output, structured data, and quick drafts; "just a quick draft" from the user overrides it entirely.

## The rules

1. **Format only what has structure.** Use headers, lists, tables or bold when the user asks for them, or when the content has structure a reader navigates: steps in order, parallel options to compare, reference data, a document type that expects it (runbook, FAQ, reference docs). Emails, essays, blog posts, reports written to be read through, and explanatory documentation are prose. The typical misfires are numbered section headers in an essay ("## 1. Your audience stops being local"), a "Bottom Line" or "Fazit" heading on a blog post, bold-lead paragraphs (`**Use existing tools.** You don't need to build software...`), bold labels on every list item, and `---` separators. When you dissolve a list, give each point its own sentence or paragraph rather than one packed block. This is the most consistent Opus tell: blog posts got headers in about four of five cases in Opus 4.8, 5 and 5.5 alike.

2. **Break the triads.** Threes are the default scaffold: three reasons, three lessons, "First... Second... Third...", "Erstens... Zweitens... Drittens...", and summary sentences of the form "sichtbarer, vernetzter und effizienter". One triad may stay. For the rest, change the presentation, not the content: merge two points, run them as flowing argument, vary the scaffold. Never add or drop a substantive point just to escape the triad.

3. **Ration the contrast figure.** "not X, but Y" / "X, not Y" / "It isn't X. It's Y." / "This isn't about X. It's about Y." / "rather than" / "nicht X, sondern Y" / "kein X, sondern Y" / "nicht nur X, sondern auch Y". At most one per text, and never as the closing line. Watch for the unprompted alternative as well: saying what the text is *not* about, what you won't do, or what stays unchanged, when nobody asked. (Opus 5.5: "nicht/kein ... sondern" in 16 of 60 German texts. OpenAI's GPT-6 Astra guide names "X, not Y" and "This isn't about X. It's about Y.")

4. **End on content.** No closing slogan or aphorism ("Write for the people first, and the code will follow." / "Unser Kalender wird es uns danken."), no German "Wer X, der Y" wisdom sentence, no summary closer ("In short," / "The bottom line" / "Kurz gesagt:" / "Unterm Strich"), no comment-bait question ("Share your experiences in the comments" / "Schreibt es gern in die Kommentare"), and no call to action where the genre doesn't call for one. A company post may point to open roles; a museum blog post doesn't need to ask for comments. (Opus 5.5: every one of 9 English and 9 German blog posts outside company and LinkedIn posts ended this way.)

5. **Cut announcement frames and hollow emphasis.** Colon reveals that stage a point instead of making it ("Die gute Nachricht: ..." / "Was wir am meisten unterschätzt haben: ..." / "Here's the thing:"), scene openers of the form "Wer X, kennt das Problem:", question-as-transition fragments ("The result? Chaos." / "Das Ergebnis? Weniger Bugs."), single-sentence paragraphs placed for drama, and hedge transitions ("It's worth noting", "Importantly", "That said" / "Erwähnenswert ist", "Dabei gilt"). Marker words: genuinely, quietly, honestly, deliberately (Claude, fading in Opus 5.5); bewusst, spürbar (German Claude text); delve, foster, leverage (suppressed in OpenAI's own GPT-6 Astra prompt, so check them in OpenAI text). Flag marker words only at three or more occurrences, or two in one paragraph; the other patterns follow the cluster heuristic.

6. **No invented specificity.** Models fabricate precise details as authenticity props: visitor counts, minutes, town sizes, inventory numbers, years. In text you produce, never invent a number: if the fact isn't given, stay honestly general or mark the assumption. In rewrites of someone else's text, keep their factual claims unchanged and flag suspicious precision as a finding instead of silently generalizing it.

7. **Start with the point, not the frame.** No thesis-statement openers that bury the hook in paragraph three, no reflex scene or analogy openers ("Imagine a restaurant..." / "Stellen Sie sich vor..." / "Viele Entwicklerteams kennen dieses Muster:"). Put the most concrete, newest information first.

8. **Em dashes: zero in text you produce or rewrite.** No em dash and no spaced en dash as a thought-dash, in both languages: use a colon, comma, parentheses, or a new sentence. In audits, list em-dash use as a finding (noting when it reads as deliberate authorial voice). Don't treat dashes as evidence of AI authorship: Opus 5.5 has practically stopped using them in prose.

9. **Say it literally.** Mannered prose swaps a direct statement for a metaphor or flourish: "a dial worth turning" for "a parameter worth varying", "earns its keep" for "still matters", "load-bearing" for "essential", "ist Gold wert", "öffnet die Tür zu". The same goes for coined compound labels presented as established terms ("exact-head checks", "editorial-row layouts"). When a literal phrase is available, use it.

## Guardrails: don't over-correct

- The cluster heuristic governs rules 1, 2, 5, 7 and 9, and the contrast count in rule 3: one hit is not a finding. Rules 6 and 8 and the closing line are the stated exceptions.
- Neither staccato nor wall. Three-word fragment chains are the same disease in reverse; so is a paragraph that packs several claims into long sentences. Split a sentence that carries more than one claim, break a paragraph where the topic turns, and keep the connectors that carry the argument ("but", "because", "sondern" inside a real argument).
- Context decides. A postmortem may be structured, a README may use bullets, a real ranking may be a list. Stripping structure the content needs is a failure too.
- Author voice protects what is not on the rules list: slang, register mixing, long sentences, unusual metaphors, deliberate repetition. Human writers use contrast figures, dashes, and punchlines as well; a satirist's aphorism is not slop. Clustered rule patterns are still worth reporting in human-written text, but report them as observations and leave the call to the author. When unsure, keep it: a wrong cut damages the text, a missed one is just a missed fix.
- Translations and close paraphrases preserve the source's rhetorical patterns, including its triads and contrasts; deslop the rendering only if the user asks for that.
- Don't fake humanity. No manufactured casualness, typos, or slang to "sound human".

## Basis

Own cold-prompt corpus, September 2026: 280 texts from the same 40 English and German prompts (email, report, blog, documentation, misc), no style instructions; Opus 5.5 (120), Opus 5 (80), Opus 4.8 (80). Measured there: the formatting, contrast, ending and marker-word rates above; em dashes in 1 of 60 English Opus 5.5 texts (an empty table cell) against 39 of 40 for Opus 5; GPT-era vocabulary (delve, tapestry, testament, journey) absent from all 140 English texts. Not measured here: Fable 5.1 and GPT-6 Astra. For those the rules rest on Anthropic's "Prompting Claude Fable 5.1" guide (writing density, mannered prose, formatting in chat) and OpenAI's GPT-6 Astra prompting guide (slop-word and contrastive-framing list). "load-bearing" comes from developer logs on Opus 5 (Matsuoka, August 2026). Earlier basis, kept where it still holds: July 2026 corpus of Opus 4.x and Fable 5 (80 texts).
