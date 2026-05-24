# Zhoubao PPT Skill

`zhoubao-ppt` is a Codex skill for turning an uploaded paper, report, thesis section, weekly report, or technical document into:

- a source-grounded `ppt_outline.md`
- an optional graduation-defense style PPT visual preview

It is designed for academic and engineering presentation workflows where the user wants content fidelity first and slide design second.

## What It Does

`zhoubao-ppt` supports two connected tasks:

1. Read the source document and create a roughly 10-page Markdown PPT outline saved as `ppt_outline.md`.
2. Generate a formal, professional, academic visual proposal from the outline as page previews or a thumbnail contact sheet.

The skill is strict about:

- using only the uploaded or provided source
- marking missing details as `原文未明确说明`
- avoiding external references unless the user explicitly asks
- keeping the visual system suitable for thesis defense or science and engineering reporting

## Install

Use Codex's built-in skill installer:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo kingwty1-star/school-weekly-ppt-skill \
  --path skills/zhoubao-ppt
```

On Windows:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo kingwty1-star/school-weekly-ppt-skill `
  --path skills/zhoubao-ppt
```

Restart Codex after installation so the skill can be discovered.

## Use

Examples:

```text
使用 $zhoubao-ppt，读取这篇论文并生成 ppt_outline.md，不要在对话框展开完整大纲。
```

```text
Use $zhoubao-ppt to read this technical document, save a source-grounded ppt_outline.md, and then create a formal defense-style PPT preview.
```

```text
使用 $zhoubao-ppt，根据这份毕业答辩 PPT 大纲直接生成整套页面预览图，只输出视觉结果。
```

## Repository Layout

```text
skills/
  zhoubao-ppt/
    SKILL.md
    agents/openai.yaml
    references/outline-spec.md
    references/visual-style.md
```

Install from `skills/zhoubao-ppt` when using the GitHub skill installer.

## License

MIT License. See [LICENSE](LICENSE).
