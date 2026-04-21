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
```

Each skill lives in its own folder under `skills/`. Subfolders inside a skill are fine (progressive disclosure pattern). Keep skills self-contained — don't reference files outside the skill folder.

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

**Important:** use `--agent "*"`, not `--agent claude-code`. Single-agent installs bypass the central `~/.agents/skills/` store and **copy** the skill instead of symlinking — then repo edits don't propagate. Multi-agent installs symlink from `~/.claude/skills/<name>` → `~/.agents/skills/<name>`.

### Update

```bash
npx skills check -g    # list outdated skills (needs -g; project-level lock isn't checked)
npx skills update -g   # reinstall all outdated skills from their source
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
