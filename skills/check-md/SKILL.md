---
name: check-md
description: >
  Review markdown documents for factual errors, logic gaps, and missing pieces.
  Use when the user asks to check, verify, review, proofread, or audit
  a .md file, plan, concept, or documentation. Also trigger on phrases like
  "schau drüber", "prüf das", "Fehler?", "check the doc", "review the plan".
disable-model-invocation: true
---

ultrathink

Thoroughly review: $ARGUMENTS

## Review axes

1. **Factual errors**: wrong facts, outdated information, incorrect technical
   details, numbers that don't add up, misattributions, wrong terminology.
2. **Logic breaks**: contradictions between sections, non sequiturs, circular
   arguments, implicit assumptions that don't hold, inconsistent terminology
   (same concept under different names, or same term for different concepts).
3. **Gaps**: missing steps in processes, unhandled edge cases, leaps in
   reasoning (A → C without B), missing prerequisites or dependencies,
   questions raised but never answered, jargon introduced without explanation.

## Severity

- **CRITICAL**: Would cause wrong decisions, broken implementations, or
  serious misunderstanding. Makes a substantial part of the document
  unreliable.
- **MEDIUM**: Confusing, inconsistent, or incomplete, but the document
  remains usable. Workaround or context exists elsewhere.
- **LOW**: Imprecisions, stylistic inconsistencies, or improvement potential
  without practical impact on usability.

## Output format

Sort findings by severity (critical first). For each finding:

### [SEVERITY] Short title

**Location:** filename, section or heading (as precise as possible)
**Category:** Factual error | Logic break | Gap
**Problem:** What exactly is wrong or missing
**Suggestion:** Concrete fix or corrected wording

If no issues are found across all three axes, confirm explicitly:
"Check complete. No factual errors, logic breaks, or gaps found.
Checked: [filename(s)], [number of sections]. Axes: factual correctness,
logic/coherence, completeness."

End with a summary line: X critical, Y medium, Z low findings.

## Rules

- Always Read the target file(s) before reviewing. Never review from memory.
- Output language matches the language of the reviewed document.
- Do not modify any files. Findings are suggestions, not corrections.
- If $ARGUMENTS contains a glob pattern or directory, use Glob to resolve
  file paths first. For multiple files, review each one and group findings
  by file.
- Be rigorous. Flag real problems. Skip stylistic nitpicks unless they
  cause actual confusion.