---
name: check-settings
description: >
  Review a Claude Code settings.json for cost and usage risks, deprecated or
  inert keys, security and permission scope, and schema validity. Verifies its
  findings against the live Claude Code docs by default before reporting them.
  Use when the user asks to check, audit, review, or optimize their Claude Code
  settings or configuration. Also trigger on phrases like "check my settings",
  "prüf meine settings", "config optimieren", "settings audit", "was soll ich
  optimieren", "review my config".
disable-model-invocation: true
---

ultrathink

Review the Claude Code settings file(s): $ARGUMENTS

You audit config. Config for a tool that changes weekly, so the facts you audit
against rot. The whole design of this skill is built around that one problem:
the *method* below is durable, the *facts* live in `references/facts.md` and get
verified at runtime, and your **tone is coupled to how sure you can be**. A
confident wrong flag that makes the user delete a working setting is worse than
no flag at all.

## Which files to review

If $ARGUMENTS names a file, review that. Otherwise resolve, in this order, and
review whichever exist:

- `~/.claude/settings.json` (user / global)
- `./.claude/settings.json` (project)
- `./.claude/settings.local.json` (local overrides)

State which files you reviewed. Do not invent settings that are not present.

## Two passes: scan, then verify before you emit

**Pass 1, static candidate scan.** Read the file. Walk the four review axes
below, cross-referencing `references/facts.md`. Produce a candidate finding list.
Each candidate carries its fact ID and its confidence class from facts.md
(`logic`, `schema`, or `heuristic`). Nothing is reported yet.

**Pass 2, verify before emit.** This runs by default. Skip it only if
$ARGUMENTS contains `offline` or `static` (use that when you know the facts are
fresh or you need speed). For each candidate:

- **`logic`**: follows from the file itself (e.g. a fallback that resolves to
  the same model). No external fact to check. Emit as-is, plainly.
- **`schema`**: documented (key names, valid values, deprecations). Fetch the
  relevant page under `code.claude.com/docs` and confirm. **Confirmed** → keep as
  stated, cite the doc. **Refuted** → drop the finding and note that facts.md is
  stale on this point. **Unreachable** → downgrade to a hedged flag.
- **`heuristic`**: believed internal behavior not in the docs (pricing, limits,
  gated experiments). Try to confirm; the docs usually won't cover it. **Not
  confirmed** → still worth surfacing, but as a *dated heuristic*, never as hard
  fact, and with any deletion advice stripped (see Delete-safety).

Verification is scoped to the keys the file actually contains: a couple of
targeted doc fetches, not a research sweep. That is the point of doing it
per-finding rather than pre-loading everything.

## Confidence sets the tone

Every finding states how sure it is. Match the wording to the class:

- **Confirmed** (`schema` verified this run, or `logic`): assert it. "ist
  ungültig", "wird ignoriert", "ist redundant."
- **Unconfirmed heuristic** (`heuristic`, or `schema` when docs were
  unreachable): hedge and date it. "Nach aktuellem Stand (facts.md, 2026-07-22),
  in der Doku nicht bestätigt: …". Say what would confirm it.

## Delete-safety

Never make *removing or renaming* a key the primary recommendation unless its
inertness was `schema`-confirmed this run. For any `heuristic` or unconfirmed
claim, the recommendation is "erst verifizieren, dann ggf. entfernen", not "remove
it". The worst outcome this skill can produce is talking the user into deleting a
setting that actually works because a stale fact called it dead.

## Review axes

Walk these four in Pass 1. The specific claims and their confidence classes are
in `references/facts.md` (fact IDs in brackets).

1. **Cost and usage risk.** Settings that quietly enlarge token spend or drain
   plan limits: expensive model as permanent default [F1], invalid `advisorModel`
   pairing [F2], persistently high `effortLevel` [F3], `skipWorkflowUsageWarning`
   [F5], a `fallbackModel` that resolves to the same model as `model` [F6], a
   redundant `[1m]` suffix [F7].

2. **Deprecated or inert keys.** `autoDreamEnabled` [F8],
   `ANTHROPIC_SMALL_FAST_MODEL` [F9], `--enable-auto-mode` in aliases/scripts
   [F10]. Any key you do not recognize: flag as "unrecognized, verify against
   current docs" [F12], not as invalid.

3. **Security and permission scope.** How much the config lets Claude do without
   asking: broad tool allows (unrestricted `Bash`/`PowerShell`), especially with
   `defaultMode: "auto"` or `bypassPermissions`; absence of `deny` rules for
   sensitive reads (`.env`, `secrets`, `~/.ssh`, `~/.aws`, `~/.gnupg`): flag
   only the gaps, presence is good; MCP servers or `additionalDirectories` that
   grant wide access.

4. **Schema and scope validity.** Session-only values in a persistent key
   (`max`/`ultracode` in `effortLevel`) [F4]; before flagging a value as invalid,
   confirm the valid set (e.g. `defaultMode`) [F11]; managed-only enforcement keys
   placed in user settings; malformed values, wrong types, typos in key names.

Only report findings with concrete impact: a real cost driver, an inert key, an
actual exposure, or a value that is silently ignored. Do not describe an ideal
config or add "nice to have" settings. The goal is what is wrong, not the perfect
file.

## Severity

- **CRITICAL**: Actively drains the plan limit, creates a real security exposure,
  or silently breaks an intended behavior.
- **MEDIUM**: Wastes tokens, relies on an inert or deprecated key, or widens
  access more than likely intended, but the setup still works.
- **LOW**: Redundancy or imprecision with no practical impact.

## Output format

Sort findings by severity (critical first). For each finding:

### [SEVERITY] Short title

**Key:** the setting(s) involved
**Category:** Cost/usage | Deprecated/inert | Security/scope | Schema/scope
**Confidence:** Confirmed (docs, `<url>`) | Logical | Unconfirmed heuristic (facts.md, 2026-07-22)
**Problem:** What exactly is wrong or wasteful. For heuristics, hedge per the tone rule.
**Suggestion:** Concrete change. Respect Delete-safety for anything not confirmed.

If nothing is found across all four axes, confirm explicitly:
"Check complete. No cost/usage risks, deprecated keys, scope issues, or schema
problems found. Reviewed: [file(s)]."

End with a summary line: X critical, Y medium, Z low findings. If Pass 2 was
skipped, add: "(offline: findings unverified against live docs)."

## Rules

- Always Read the target file(s) before reviewing. Never review from memory.
- Do not modify any files. Findings are suggestions, not edits.
- Output language matches the user's language (German by default here). Keep key
  names, values, and flags in their exact English form inside backticks.
- Verification is on by default; `offline`/`static` in $ARGUMENTS turns it off.
  When on, verify only the keys the file contains, against `code.claude.com/docs`.
- If $ARGUMENTS is empty, resolve the default files above. If none exist, ask
  which file to review rather than guessing.
- Be rigorous on real risks. Skip cosmetic preferences (status line, voice,
  notifications, TUI, cleanup period) unless they cause an actual problem.
