# skill-collection-steiner-chris

Personal collection of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills.

## Skills

| Skill | Description |
|-------|-------------|
| [anti-slop](skills/anti-slop/) | Detect and eliminate AI-generated writing patterns (EN/DE) |
| [check-md](skills/check-md/) | Review markdown documents for factual errors, logic breaks, and gaps |
| [marp-slides](skills/marp-slides/) | Write or normalize Marp markdown for the DHCraft Google Slides importer |
| [winston-slides](skills/winston-slides/) | Audit or draft slide decks using Patrick Winston's MIT clarity rules |

## Install

Recommended: [`npx skills`](https://github.com/vercel-labs/skills) CLI.

```bash
# Install a single skill globally (use --agent "*" for symlink into ~/.claude/skills/)
npx skills add chsteiner/skill-collection-steiner-chris -g --agent "*" --skill check-md -y

# Install all skills
npx skills add chsteiner/skill-collection-steiner-chris -g --agent "*" --all
```

Skills install into `~/.agents/skills/` and symlink into `~/.claude/skills/`. To check / update:

```bash
npx skills check -g   # list outdated skills
npx skills update -g  # pull latest versions
```

If you clone this repo to develop skills locally, see [CLAUDE.md](CLAUDE.md) for the dev workflow — repo edits don't auto-propagate into `~/.agents/skills/`; you need to re-run `npx skills add` after every change.

Alternative: copy a skill folder into your project's `.claude/skills/` directory manually.

## Companion tools

| Tool | Purpose |
|------|---------|
| [tools/marp-importer](tools/marp-importer/) | Google Apps Script that imports `marp-slides` markdown into the DHCraft Google Slides template. See [SETUP.md](tools/marp-importer/SETUP.md). |

## Adding a new skill

1. Create a folder under `skills/` (kebab-case name)
2. Add a `SKILL.md` with valid frontmatter and prompt
3. Follow the conventions in [CLAUDE.md](CLAUDE.md)
