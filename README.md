# School Weekly PPT Skill

`school-weekly-ppt` is a Codex skill for turning a Markdown school weekly report into a blue, technical PowerPoint learning-report deck.

It is designed for weekly academic or engineering study reports where the input is a `.md` file and the output should be a polished `.pptx` with:

- 7-9 slide weekly-report structure.
- Blue formal report style.
- Emphasized key points instead of equal-weight note dumping.
- Editable principle diagrams for formulas, variables, arrows, thresholds, shadows, and physical meaning.
- Rendered slide previews for visual QA.

## Install

Use Codex's built-in skill installer:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo kingwty1-star/school-weekly-ppt-skill \
  --path skills/school-weekly-ppt
```

On Windows, the installer path is usually:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo kingwty1-star/school-weekly-ppt-skill `
  --path skills/school-weekly-ppt
```

Restart Codex after installing so the skill is discovered.

## Use

Invoke the skill in Codex:

```text
使用 $school-weekly-ppt，根据 notes/inbox/本周学习周报.md 制作汇报 PPT
```

Or:

```text
Use $school-weekly-ppt to create a blue PowerPoint from this Markdown school weekly report.
```

## Repository Layout

```text
skills/
  school-weekly-ppt/
    SKILL.md
    agents/openai.yaml
    references/visual-style.md
    scripts/build_school_weekly_ppt.mjs
```

The skill itself lives under `skills/school-weekly-ppt`, which is the path used by the Codex GitHub skill installer.

## Requirements

- Codex with the Presentations/PPTX capability available.
- Node.js runtime available to Codex.
- A Markdown weekly report as input.

The included script uses the local Presentations artifact-tool runtime to generate an editable `.pptx` and slide previews.

## License

MIT License. See [LICENSE](LICENSE).
