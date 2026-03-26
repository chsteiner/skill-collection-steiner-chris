# Skill Collection — steiner-chris

A curated collection of Claude Code skills (SKILL.md files) for reuse across projects.

## Repository structure

```
skills/
  <skill-name>/
    SKILL.md        # The skill definition (frontmatter + prompt)
```

Each skill lives in its own folder under `skills/`. One folder = one skill. No nesting.

## Conventions

- **Folder name** = skill name (kebab-case, e.g. `check-md`)
- **Frontmatter** must include: `name`, `description` (with trigger phrases), `disable-model-invocation`
- **Description** should list both EN and DE trigger phrases where applicable
- **Output language** matches the input language (bilingual repo: DE/EN)
- Skills must be self-contained — no external dependencies or file references
- Keep skills focused: one skill = one job

## Quality checklist for skills

- [ ] Frontmatter is valid YAML
- [ ] `name` matches folder name
- [ ] `description` includes clear trigger conditions
- [ ] Prompt has structured output format
- [ ] Rules section defines boundaries (what the skill does NOT do)
- [ ] Tested manually with at least one real input
