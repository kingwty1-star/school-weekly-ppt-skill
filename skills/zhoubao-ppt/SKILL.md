---
name: zhoubao-ppt
description: Parse an uploaded paper, thesis section, research report, weekly report, or technical document into a source-grounded `ppt_outline.md`, and optionally generate a formal academic-defense PPT visual preview/contact sheet. Use when the user mentions 文献, 论文, 技术文档, 毕业答辩, 周报 PPT, 研究汇报, or asks for a PPT outline or visual方案 strictly based on the provided document or outline.
---

# Zhoubao PPT

## Purpose

Use this skill for a two-stage academic PPT workflow:

1. Read the provided source document and save a roughly 10-page Markdown PPT outline to `ppt_outline.md`.
2. When requested, turn that outline into a unified graduation-defense visual preview, usually as a multi-page thumbnail board or contact sheet.

This skill is strict about source fidelity. Do not use outside sources unless the user explicitly asks. Do not invent facts, experiments, metrics, author information, or conclusions. When the source does not clearly provide something, label it `原文未明确说明`.

## When To Use

Trigger this skill when the user asks for any of the following:

- Read a paper, report, or technical document and generate a PPT outline.
- Save the outline to `ppt_outline.md` instead of pasting the full outline in chat.
- Build a literature-sharing, course presentation, thesis-defense, or technical-briefing outline from an uploaded source.
- Generate a formal PPT visual scheme or page-preview board directly from a provided outline.
- Complete the full chain: document parsing first, visual proposal second.

Typical requests:

- `用这篇论文生成 10 页左右的 PPT Markdown 大纲，保存成 ppt_outline.md。`
- `根据这份毕业答辩 PPT 大纲，直接生成整套页面预览图。`
- `先读文档，再出 ppt_outline.md，然后给我一套正式学术风格的 PPT 视觉方案。`

## Workflow Decision

- If the user provides a source document and wants analysis, summary, or a PPT outline, read `references/outline-spec.md` and produce or update `ppt_outline.md`.
- If the user provides a PPT outline and wants style or visual design only, read `references/visual-style.md` and generate the visual result directly.
- If the user wants the complete workflow, do the outline first and then use that outline as the sole content basis for the visual preview.
- If the user asks for visual output but only provided the source document, create `ppt_outline.md` first rather than asking an avoidable question.
- If neither the source document nor the outline is available, ask once for the missing input and keep the question short.

## Stage 1: Build `ppt_outline.md`

Read `references/outline-spec.md` before writing the outline.

Core rules:

1. Read the whole document before restructuring it into slides.
2. Reorganize the material for presentation logic instead of copying the original table of contents.
3. Keep the outline at about 10 pages unless the source clearly needs a small adjustment.
4. Every page must include:
   - page title
   - core content
   - suggested presentation form
5. Prioritize formulas, model structures, algorithms, datasets, experiment settings, results, tables, figures, and case analysis whenever the source includes them.
6. If the source lacks an expected item, write `原文未明确说明`.
7. Add `资料来源核对说明` at the end and map each page back to source sections, figures, tables, experiments, or key paragraphs.
8. Save the result to `ppt_outline.md`.

If the user explicitly says not to print the full outline in chat, do not paste it. Reply briefly after saving the file.

## Stage 2: Generate The Visual Preview

Read `references/visual-style.md` before producing any visual result.

Core rules:

1. Use the provided outline, or the just-created `ppt_outline.md`, as the only content basis.
2. Generate the result as page previews, slide thumbnails, or a multi-page contact sheet rather than a prose design memo.
3. Keep the style formal, professional, academic, clean, and stable.
4. Use the specified light-gray, deep-blue, and cyan-blue system consistently across all pages.
5. Keep information density sufficient for a real thesis-defense or engineering presentation.
6. Make charts, flowcharts, tables, and module diagrams feel like one design system.
7. When the user says `只输出视觉结果` or gives equivalent constraints, return only the visual output and no extra explanation.

If the user later asks for an editable deck instead of only previews, use the same outline and same visual system to produce a `.pptx` with the available PPT or presentation capabilities.

## Output Contract

- Outline-only requests: create or update `ppt_outline.md`, do not dump the full Markdown if the user asked for file-only output, and keep the chat reply short.
- Visual-only requests: output the visual result directly and avoid suggestions, markdown, code, or long prose.
- Full workflow requests: generate `ppt_outline.md` first, then create the visual preview from it.

## Resources

- `references/outline-spec.md`: slide-structure contract and source-checking rules for `ppt_outline.md`
- `references/visual-style.md`: defense-style palette, layout system, and visual-output rules
