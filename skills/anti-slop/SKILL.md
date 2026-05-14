---
name: anti-slop
description: "Detects and removes AI-generated writing patterns (slop) in prose — generic phrasing, filler, throat-clearing, robotic structure. Works two ways: as a self-check while generating reports, articles, emails, or documentation, and as an explicit audit of existing text. Covers English and German. Use this whenever the user asks to 'check for slop', 'deslop' something, or 'anti-slop mode' — and also whenever they say a text sounds AI-generated, robotic, generic, stiff, or 'like ChatGPT wrote it', want writing to 'sound human', or ask to cut clichés, filler, or empty phrases (German: Floskeln, leere Phrasen) — even if they never say the word 'slop'. Also applies when generating prose longer than ~200 words. Not for code, commit messages, terminal output, structured data, or quick throwaway drafts."
---

# Anti-Slop

> **If it could be sent to anyone in any industry without modification, it's slop.**

This skill removes AI-generated writing patterns. It runs in two modes, and the patterns live in reference files — load the one you need instead of carrying all of them.

## Modes

**Self-check** — while generating prose over ~200 words (reports, articles, emails, docs). Run the lightweight check below before you output. Don't show the check; just apply it.

**Audit** — when the user says "check for slop", "deslop this", or "anti-slop mode". Read [references/audit-scoring.md](references/audit-scoring.md) and follow the workflow there. "Check" means diagnose only; "deslop" means diagnose and rewrite.

Skip both modes for code, commit messages, terminal commands, structured data, and quick drafts. An explicit user request ("just a quick draft", "don't polish this") always overrides the automatic self-check.

## Core principles

1. **Specificity over generality.** Every claim needs a concrete detail. If a sentence works for any company in any field, rewrite it — but never invent a detail you don't have. Honest generality beats confident fiction: if you have no specific, say so plainly or cut the claim.
2. **Cut throat-clearing.** If a sentence can go without losing information, it goes.
3. **Respect the reader.** No manufactured enthusiasm, no fake conversational tone, no motivational closers.
4. **Vary rhythm.** Mix sentence lengths — but don't swing to staccato. Choppy three-word fragments are also slop.
5. **Context decides.** A word that's slop in a blog post can be correct in a legal spec or a statistics paper. When unsure, keep it: a wrongly cut word damages the text, a missed one is just a missed fix.

## Lightweight self-check

Before outputting prose, scan for these five things. This is the fast pass — load the reference tables only if you need the full lists.

1. **Tier 1 words and phrases** (EN + DE) — any present? Replace them.
2. **Generic paragraphs** — could this be sent to anyone in any field? Add a real specific. Do not invent one.
3. **Empty opener or closer** — does the first sentence announce what you'll do, or the last one motivate, summarize, or encourage? Cut it.
4. **Clustering** — the same connector, the same sentence opening, or the same structure three or more times? Vary them.
5. **Over-correction** — did your cuts leave staccato fragments or invented detail? Restore the flow.

## How not to over-correct

This skill is mostly subtractive, and the failure mode is swinging too far the other way:

- **Don't invent specificity.** If you don't know the number, the name, or the date, don't fabricate one. A claim you can't support should be stated honestly as general, or cut.
- **Don't staccato.** Cutting words is good. Cutting until every sentence is three words long is the same disease wearing a different coat.
- **Connectors are allowed.** "However", "also", "because" carry real logical relationships. Cut them when they're filler, keep them when they're load-bearing.
- **Author voice beats the quota.** A writer who uses em-dashes deliberately, or a long sentence on purpose, is not producing slop. The numeric heuristics in the references are guides, not laws.

## Pattern references

Load only what the current task needs:

- **English patterns** — Tier 1 (remove), Tier 2 (check context), Claude-specific tells → [references/patterns-en.md](references/patterns-en.md)
- **German patterns** — Tier 1, connectors, hedging, translation artifacts, Claude-specific tells → [references/patterns-de.md](references/patterns-de.md)
- **Structural tells** — formatting, rhythm, composition, chat artifacts → [references/structural-tells.md](references/structural-tells.md)
- **Audit workflow and scoring** — for explicit "check" / "deslop" requests → [references/audit-scoring.md](references/audit-scoring.md)

## A note on the target model

Slop markers have a shelf life. Single-word tells ("delve", "tapestry") fade within roughly 12–18 months as models and writers adapt; structural tells (over-formatting, rule of three, copula avoidance) stay stable. The reference tables flag markers that are measurably fading. For Claude Opus 4.7 specifically, the dominant current regression is **over-formatting** — reaching for bullets, headers, and bold where flowing prose belongs. Em-dash overuse, by contrast, is mostly a GPT tell; Opus 4.7 already suppresses it, so weight it lightly during self-check and keep it mainly for auditing other models' text.

## Sources

- Kobak et al., "Delving into LLM-assisted writing in biomedical publications" — *Science Advances* 2025, 15M PubMed abstracts. The largest quantitative study; supersedes earlier word-frequency work.
- Liang et al., Finnish essay study — 56,878 essays, post-ChatGPT vocabulary shifts ("delve" +10.45x).
- Georgia Tech analysis of AI markers in academic articles.
- Wikipedia WikiProject AI Cleanup, "Signs of AI writing" (current revision).
- Irrgang, Solopova et al., "Features and Detectability of German Texts Generated with LLMs" — KONVENS 2024 (TU Berlin). Strongest empirical basis for the German section.
- Anthropic Claude 4 / Opus 4.7 system prompts and Opus 4.5 / 4.6 system cards — anti-flattery and anti-over-formatting instructions, sycophancy measurements.
- "The Last Fingerprint: How Markdown Training Shapes LLM Prose" (2026) — em-dash frequency by model.
- stop-slop (MIT), claude-slop-detector (MIT), DeSlop (GPL-3.0), humanizer (MIT).
