# skill-collection-steiner-chris

Personal collection of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills.

## Skills

| Skill | Description |
|-------|-------------|
| [anti-slop](skills/anti-slop/) | Detect and eliminate AI-generated writing patterns (EN/DE) |
| [check-md](skills/check-md/) | Review markdown documents for factual errors, logic breaks, and gaps |
| [marp-slides](skills/marp-slides/) | Write Marp markdown presentations for the DHCraft Google Slides importer |

## Install

Recommended: [`npx skills`](https://github.com/vercel-labs/skills) CLI.

```bash
# Install a single skill globally
npx skills add chsteiner/skill-collection-steiner-chris -g --agent claude-code --skill check-md -y

# Install all skills
npx skills add chsteiner/skill-collection-steiner-chris -g --agent claude-code --all
```

Skills are symlinked into `~/.claude/skills/`. To update after changes:

```bash
npx skills check -g   # list outdated skills
npx skills update -g  # pull latest versions
```

Alternative: copy a skill folder into your project's `.claude/skills/` directory manually.

## Companion tools

| Tool | Purpose |
|------|---------|
| [tools/marp-importer](tools/marp-importer/) | Google Apps Script that imports `marp-slides` markdown into the DHCraft Google Slides template. See [SETUP.md](tools/marp-importer/SETUP.md). |

## Adding a new skill

1. Create a folder under `skills/` (kebab-case name)
2. Add a `SKILL.md` with valid frontmatter and prompt
3. Follow the conventions in [CLAUDE.md](CLAUDE.md)
