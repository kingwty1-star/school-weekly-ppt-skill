---
name: school-weekly-ppt
description: Create a blue, technical PowerPoint learning report from a Markdown school weekly report. Use when the user provides or references a .md weekly report, study notes, learning summary, school progress report, or asks to make the same style of weekly-report PPT with emphasized key points, formula/principle diagrams, variables, arrows, shadows, and editable PPTX output.
---

# School Weekly PPT

## Purpose

Turn one Markdown school weekly report into a polished 7-9 slide PPTX for technical or academic reporting. Preserve the report's learning story, but redesign it for presentation: one main point per slide, blue formal style, clear hierarchy, and at least one key mechanism/principle slide when formulas, models, algorithms, or variables appear.

Always use the available Presentations/PPTX skill or plugin for final `.pptx` work. Use image generation only for optional supporting visuals such as a cover atmosphere or technical background; principle diagrams should usually be editable shapes, arrows, labels, shadows, and highlights.

## Inputs And Outputs

Require one Markdown input file. If the user only says "the weekly report" or "notes/inbox", find the most relevant `.md` file in the workspace and state the assumption.

Default outputs:

- `outputs/final/<week-or-title>-学习周报.pptx`
- rendered slide previews under `outputs/ppt-work/<deck-name>/preview/`
- optional contact sheet for visual QA

Use `scripts/build_school_weekly_ppt.mjs` for a first draft when the report is a normal Markdown weekly report. Patch or extend the generated script/deck when the report has domain-specific formulas that need a more custom principle diagram.

## Workflow

1. Read the Markdown report and extract: week/title, learning topic, top 3 progress points, workflow/path, key mechanism or formula, problems/corrections, and next-week plan.
2. Build an 8-slide storyline by default: cover, core progress, learning path, weekly detail/timeline, key mechanism diagram, knowledge map, problems/corrections, next plan.
3. Highlight only 1-2 ideas per slide. Push secondary information into smaller cards, captions, or pale-blue supporting areas.
4. Read `references/visual-style.md` before designing the deck. Follow the blue palette and principle-diagram rules there.
5. Generate an editable PPTX with Presentations/artifact-tool. Use `Microsoft YaHei` for Chinese text and a neutral Latin font for variable labels.
6. Render PNG previews for every slide. Check page count, Chinese rendering, text overflow, visual hierarchy, and whether the key mechanism diagram explains physical meaning rather than merely labeling variables.
7. Return the final PPTX path and mention the preview/contact-sheet path. If any validation step cannot run, say so explicitly.

## Quick Draft Script

From a workspace root, run:

```powershell
$env:HOME = $env:USERPROFILE
$env:PYTHON = "C:\Users\17476\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
& "C:\Users\17476\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" `
  "C:\Users\17476\.codex\skills\school-weekly-ppt\scripts\build_school_weekly_ppt.mjs" `
  --input ".\outputs\final\2026W21-学习周报.md" `
  --output ".\outputs\final\2026W21-学习周报.pptx"
```

Useful options:

- `--title "..."` overrides the cover title.
- `--week "2026W21"` overrides the week label.
- `--workdir ".\outputs\ppt-work\my-weekly-report"` controls preview/manifest location.
- `--slides 8` keeps the standard same-style report deck.

## Content Rules

Do not copy the Markdown page-by-page. Convert prose into presentation hierarchy:

- Cover: topic, week, project/domain chips, and a simple visual metaphor.
- Progress: three high-confidence achievements from the report.
- Path: how the learning moved from input/materials to method, experiment/code, and output.
- Detail: the most important weekly work loop, timeline, or decomposition.
- Mechanism: the most important formula/model/algorithm visualized with variables, arrows, shaded gaps/thresholds, and captions that explain physical meaning.
- Reflection: corrections, misunderstandings, bottlenecks, or remaining questions.
- Next plan: 3-4 concrete actions for the next week.

For formula-heavy reports, treat the key mechanism slide as the visual peak. If variables such as `x`, `yd`, `z1`, `v`, `u`, `etaHat`, `gamma`, or `theta` appear, place each variable on the object/action it represents and show the relationship with arrows or shaded distances.

## Validation Checklist

Before final response:

- Verify the PPTX exists and has the expected slide count.
- Extract slide XML or otherwise confirm key text is embedded.
- Inspect preview PNGs or a contact sheet.
- Confirm the key slide uses editable shapes for variables, formulas, arrows, and highlights.
- Keep the final response concise: final PPTX link, slide count, preview path, and any validation caveat.
