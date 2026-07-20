---
name: anti-slop
description: "Removes the measured writing tells of Claude Opus 4.x and Claude Fable 5 in prose: over-formatting, triad scaffolding, contrast cliches, polished punchline endings, hollow emphasis, invented specificity. Works two ways: as a silent self-check while generating reports, articles, emails, or documentation, and as an explicit audit of existing text. Covers English and German. Use whenever the user asks to 'check for slop', 'deslop' something, or 'anti-slop mode', and also whenever they say a text sounds AI-generated, robotic, generic, stiff, or 'like ChatGPT wrote it', want writing to 'sound human', or ask to cut cliches, filler, or empty phrases (German: Floskeln, leere Phrasen), even if they never say the word 'slop'. Also applies when generating prose deliverables longer than ~200 words. Not for code, commit messages, terminal output, structured data, or quick throwaway drafts."
---

# Anti-Slop

Calibrated for Claude Opus 4.x and Claude Fable 5. These models do not fail through GPT-era vocabulary ("delve", "tapestry", em-dash floods); they fail through structure and rhetoric: too much formatting, everything in threes, contrast figures as punchlines, endings polished into aphorisms. Every rule below is backed by a corpus measurement of both models' own cold-prompt output (see Basis).

The master heuristic: look for clusters of patterns, not single hits. One contrast figure is writing; three of them plus a bold-lead scaffold plus an aphorism ending is slop. (Exceptions: rules 6 and 8 are zero-tolerance for text you produce, and a contrast figure as the closing line is a finding on its own.)

## Modes

**Self-check**: silent, while generating prose deliverables over ~200 words (reports, articles, emails, blog posts, documentation prose). Apply the rules before output; don't show the check. Conversational chat replies are not deliverables; leave them out.

**Audit**: when the user says "check for slop" (diagnose only) or "deslop" (diagnose and rewrite). An explicit audit request always runs, even on text types the self-check skips (someone may well say "deslop this commit message"; do it). Reply in the user's language; quote passages verbatim in their original language.

Audit output format:

1. Findings as a numbered list: quoted passage (or a section reference for document-wide findings such as over-formatting or a buried lede), rule number, suggested fix, one line each. Group repeated hits of the same rule into one finding with a count and one or two examples.
2. For "deslop" only: the full rewritten text after the findings.
3. If the text is clean, say so in one sentence. Don't manufacture findings.

In both modes, fenced or inline code and verbatim quotations are exempt from all rules. The self-check also stays off for code, commit messages, terminal output, structured data, and quick drafts; "just a quick draft" from the user overrides it entirely.

## The rules

1. **Prose stays prose.** In emails, reports, blog posts, and explanatory documentation: no bullets, headers, or bold unless the user asked or the document type genuinely needs them (reference docs, runbooks, FAQs). Dissolve bold-lead paragraph scaffolding (`**The tooling was the easy part.** ...`) into plain sentences. Measured: the strongest tell in both families, present in roughly a third of essay-register outputs, Fable more than Opus.

2. **Break the triads.** Both models default to threes: three layers, three reasons, three lessons, "First... Second... Third...", "Erstens... Zweitens... Drittens...", enumerations of the form X, Y, and Z. One triad may stay. For the rest, change the presentation, not the content: merge two points, run them as flowing argument, vary the scaffold. Never add or drop a substantive point just to escape the triad. ("erstens/zweitens/drittens" measured 90 to 290 times over-represented in Fable's German output.)

3. **Ration the contrast figure.** "not X, but Y" / "It isn't X. It's Y." / "rather than" / "nicht X, sondern Y" / "kein X, sondern Y" / "statt". At most one per text, and never as the closing line; a contrast as the final sentence is a finding even if it's the only one. Best-documented structural marker of the Claude family; "rather than" alone appeared in over a third of the measured English samples.

4. **End without a punchline.** Both models polish endings into aphorisms ("The tool is good; the dosage decides." / "Das war unbequem und genau der Punkt.") and German "Wer X, der Y" wisdom sentences (measured in a fifth to a third of German samples, stronger in Opus). End with the last piece of content instead. Also cut motivational closers and call-to-action endings ("Schreibt uns!", "I'd love to hear...") where none belong.

5. **Cut hollow emphasis and hedge patterns.** This covers importance announcements without substance ("Here's the thing", "Der entscheidende Punkt ist"), engineered drama beats ("Danach war es sehr still im Raum."), question-as-transition fragments ("The result? Chaos." / "Das Ergebnis? Weniger Bugs."), single-sentence paragraphs placed for drama, hedge transitions ("It's worth noting", "That said" / "Erwähnenswert ist", "Dabei gilt"), and the marker adverbs: genuinely, honestly, straightforward, actually, quietly (EN); bewusst, genau, eigentlich, ehrlich gesagt (DE). Flag marker adverbs only at three or more occurrences, or two in one paragraph; the other patterns follow the cluster heuristic. ("genuinely" measured 92x over-represented in Opus English; "bewusst" appeared in 8 of 20 Fable German samples.)

6. **No invented specificity.** Fable especially fabricates precise details as authenticity props: vote counts, person-days, phone extensions, attendance figures. In text you produce, never invent a number: if the fact isn't given, stay honestly general or mark the assumption. In rewrites of someone else's text, keep their factual claims unchanged and flag suspicious precision as a finding instead of silently generalizing it.

7. **Start with the point, not the frame.** No thesis-statement openers that bury the actual hook in paragraph three, and no reflex analogy openers ("Imagine a restaurant..." / "Stellen Sie sich vor..."). Put the most concrete, newest information first. (Fable's documented cold-prompt weakness.)

8. **Em dashes: zero in text you produce or rewrite.** No em dash and no spaced en dash as a thought-dash, in both languages: use a colon, comma, parentheses, or a new sentence. In audits, list em-dash use as a finding (noting when it reads as deliberate authorial voice); in rewrites, replace it.

## Guardrails: don't over-correct

- The cluster heuristic governs rules 1 to 5 and 7: one hit is not a finding. Rules 6 and 8 are the stated exceptions.
- Don't staccato. Cutting is good; three-word fragment chains are the same disease in reverse. Vary sentence length, keep load-bearing connectors ("but", "because", "sondern" inside a real argument).
- Context decides. A postmortem may be structured, a README may use bullets, a real ranking may be a list. The rules target prose registers, not reference material.
- Author voice protects what is not on the rules list: slang, register mixing, long sentences, unusual metaphors, deliberate repetition. Clustered rule patterns are still worth reporting in human-written text, but report them as observations and leave the call to the author. When unsure, keep it: a wrong cut damages the text, a missed one is just a missed fix.
- Translations and close paraphrases preserve the source's rhetorical patterns, including its triads and contrasts; deslop the rendering only if the user asks for that.
- Don't fake humanity. No manufactured casualness, typos, or slang to "sound human".

## Out of scope

GPT-era word lists (delve, tapestry, testament, landscape, journey...) are deliberately absent: they are not priority markers for Opus 4.x or Fable 5. When auditing text that came from other model families, check vocabulary separately.

## Basis

Own cold-prompt corpus measurement, July 2026: 80 texts (20 per model per language, DE and EN, business/docs/blog registers), lexical over-representation against a wordfreq baseline plus structural pattern counts. Cross-checked against EQ-Bench slop profiles, Anthropic's Fable 5 prompting guidance and system-prompt word bans (genuinely, honestly, straightforward), and community observation (mid-2026).
