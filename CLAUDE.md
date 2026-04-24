# Skill Collection — steiner-chris

A curated collection of Claude Code skills (SKILL.md files) for reuse across projects.

## Repository structure

```
skills/
  <skill-name>/
    SKILL.md        # Required: skill definition (frontmatter + prompt)
    scripts/        # Optional: helper scripts the skill invokes
    references/     # Optional: docs loaded on-demand during skill execution
    assets/         # Optional: templates, icons, fonts used in output
tools/
  <tool-name>/      # Related non-skill code (e.g. importers, consumers)
```

Each skill lives in its own folder under `skills/`. Subfolders inside a skill are fine (progressive disclosure pattern). Keep skills self-contained — don't reference files outside the skill folder.

`tools/` is for companion code that a skill depends on but isn't itself a skill (e.g. the Apps Script importer for `marp-slides`). Kept out of `skills/` because `npx skills` scans that folder and would treat unrelated files as skill candidates.

## Conventions

- **Folder name** = skill name (kebab-case, e.g. `check-md`)
- **Frontmatter** must include: `name`, `description` (with trigger phrases)
- **`disable-model-invocation: true`** for skills that should only fire on explicit slash-command (e.g. audits, reviews). Omit for skills that benefit from auto-triggering (e.g. writing/formatting skills).
- **Description** should list both EN and DE trigger phrases where applicable
- **Output language** matches the input/document language (bilingual repo: DE/EN)
- Keep skills focused: one skill = one job

## Installing / updating skills locally

Use [`npx skills`](https://github.com/vercel-labs/skills). Lock file is at `~/.agents/.skill-lock.json`, managed for you.

### Install

```bash
# From repo root, install a single skill to ALL agents (required for symlink behavior)
npx skills add . -g --agent "*" --skill <skill-name> -y

# Install all skills in the repo
npx skills add . -g --agent "*" --all
```

**Important:** use `--agent "*"`, not `--agent claude-code`. Single-agent installs bypass the central `~/.agents/skills/` store. Multi-agent installs place the skill in `~/.agents/skills/<name>/` and symlink `~/.claude/skills/<name>` → `~/.agents/skills/<name>`.

### Repo edits don't propagate — re-install after every change

`npx skills add` **copies** the skill from the repo into `~/.agents/skills/<name>/`. The symlink is only between `~/.claude/skills/` and `~/.agents/skills/` — it does **not** extend back to the repo. Editing `skills/<name>/SKILL.md` in the repo has zero effect on the installed skill until you re-install.

After any edit to a skill in this repo (SKILL.md, scripts/, references/, assets/), run:

```bash
# Re-install a single edited skill
npx skills add . -g --agent "*" --skill <skill-name> -y

# Or, after batch edits, re-install everything that's out of date
npx skills update -g
```

Same rule when you add a new file inside an existing skill (e.g. a new `scripts/foo.mjs`): the file lives only in the repo until the next `npx skills add`.

### Check state

```bash
npx skills check -g    # list outdated skills (needs -g; project-level lock isn't checked)
```

### If a skill is still a copy instead of a symlink

Happens when a previous install created a real directory (e.g. single-agent install, or install from GitHub URL). Remove it and reinstall with `--agent "*"`:

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills\<name>"
Remove-Item -Recurse -Force "$env:USERPROFILE\.agents\skills\<name>" -ErrorAction SilentlyContinue
```

Then the `npx skills add . -g --agent "*" --skill <name> -y` command from above.

## Quality checklist for skills

- [ ] Frontmatter is valid YAML
- [ ] `name` matches folder name
- [ ] `description` includes clear trigger conditions
- [ ] Prompt has structured output format
- [ ] Rules section defines boundaries (what the skill does NOT do)
- [ ] Tested manually with at least one real input (or evaluated via `/skill-creator`)
