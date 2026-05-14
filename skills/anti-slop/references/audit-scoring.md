# Audit Workflow and Scoring

Load this when the user explicitly asks to "check for slop", "deslop this", or runs "anti-slop mode" on a piece of text. For the self-check during your own generation, you don't need this file — the lightweight check in SKILL.md is enough.

## Contents

- [Check vs. deslop](#check-vs-deslop)
- [Workflow](#workflow)
- [The five dimensions](#the-five-dimensions)
- [Verdict](#verdict)
- [Report format](#report-format)

## Check vs. deslop

The two triggers mean different things:

- **"check for slop"** — diagnose only. Produce the report. Do not rewrite the text.
- **"deslop this"** — diagnose *and* rewrite. Produce the report, then deliver the revised text.
- **"anti-slop mode"** — treat as deslop unless the user says otherwise.

When in doubt which the user wants, ask. Don't rewrite text the user only wanted diagnosed.

## Workflow

1. **Identify the language.** Load `patterns-en.md`, `patterns-de.md`, or both. Always load `structural-tells.md`.
2. **Scan for Tier 1 hits.** List each one with a line reference and the suggested fix.
3. **Scan for Tier 2 clusters.** A single Tier 2 word is not a hit — flag only where three or more cluster in a paragraph, or where a word stands in for a concrete detail. Note the cluster, don't list every word.
4. **Scan for structural tells.** Note which apply, with a line reference where one exists.
5. **Run the five-dimension checklist** (below). Each dimension is pass or fail with a one-line reason — no numeric score.
6. **Give the verdict** and the top revision priorities.
7. **If deslopping:** rewrite, then state what you changed and what you deliberately left (e.g. a Tier 1 word kept because it was domain-correct).

## The five dimensions

The old version scored each of these 1–10 and summed them. That was theatre — there were no anchor points between 1 and 10, so two runs over the same text produced different numbers. Use pass/fail instead. It's reproducible and it tells the writer *which* thing to fix.

Each dimension is **pass** or **fail**, with one sentence of reason.

| Dimension | Passes if... | Fails if... |
|-----------|-------------|-------------|
| **Specificity** | Claims carry concrete, real detail — names, numbers, examples | Statements are generic enough to apply to any company in any field |
| **Rhythm** | Sentence length varies naturally when read aloud | Uniform medium-length sentences, *or* over-corrected into staccato fragments |
| **Trust** | Treats the reader as capable — no over-explaining, no hedging clusters | Patronizes, over-hedges, qualifies before answering |
| **Authenticity** | Reads like a specific person with a position wrote it | Reads like a committee avoiding offense; diplomatic balance everywhere |
| **Density** | Every sentence carries information | Padding, throat-clearing, empty openers and closers |

Note on Rhythm: it fails in *both* directions. Metronomic uniformity is slop; so is choppy fragmentation produced by over-aggressive cutting. Don't pass a text just because it's short and punchy.

## Verdict

A traffic light, not a number:

- **Clean** — zero or one Tier 1 hit, no Tier 2 clusters, all five dimensions pass. Ship it.
- **Revise** — a few Tier 1 hits or one failing dimension. Worth a targeted pass before delivering.
- **Heavy revision** — Tier 1 hits throughout, multiple failing dimensions, or structural tells across the text. Rewrite, don't patch.

## Report format

```
## Slop audit

**Verdict:** Clean / Revise / Heavy revision

### Tier 1 hits
- Line N: "<phrase>" → <suggested fix>
- Line N: "<phrase>" → <suggested fix>

### Tier 2 clusters
- Lines N–M: <which words cluster, why it reads as slop>

### Structural tells
- <pattern> — <where, and the fix>

### Five dimensions
- Specificity: pass/fail — <one line>
- Rhythm: pass/fail — <one line>
- Trust: pass/fail — <one line>
- Authenticity: pass/fail — <one line>
- Density: pass/fail — <one line>

### Top priorities
1. <the single most important fix>
2. <next>
3. <next>
```

If deslopping, append the rewritten text after the report, plus a short note on anything you deliberately kept and why.

## Don't over-correct the audit

The same warning from SKILL.md applies when you rewrite:

- Don't invent specifics to make the Specificity dimension pass. If the original had no real detail, the honest fix is to cut the empty claim, not fabricate a number.
- Don't cut into staccato to make the Density dimension pass.
- Keep a flagged word when it's genuinely domain-correct, and say so in the report rather than silently removing it.
- Preserve the author's voice. The goal is text that reads like a specific person wrote it — not text that reads like this skill wrote it.
