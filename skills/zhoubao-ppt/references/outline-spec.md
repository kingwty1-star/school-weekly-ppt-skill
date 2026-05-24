# PPT Outline Specification

Use this reference whenever the user wants `ppt_outline.md` from a paper, report, thesis section, weekly report, or technical document.

## Non-Negotiable Rules

1. All content must come from the uploaded or provided source document.
2. Do not invent facts, claims, data, author information, experiments, or conclusions.
3. If a statement is a summary or structural rewrite of the source, keep it faithful and do not over-extend the meaning.
4. If the source does not clearly provide an item, label it `原文未明确说明`.
5. Do not use external references unless the user explicitly asks for them.
6. The output file must be `ppt_outline.md`.
7. The file must be complete Markdown and suitable for downstream PPT tools.

## Slide Count And Density

- Target about 10 slides.
- A small adjustment is acceptable if the source structure strongly requires it.
- Do not leave pages empty or skeletal.
- Keep enough content on each page that the outline can be turned into a real PPT without re-reading the source from scratch.

## Required Per-Slide Fields

Every slide section must include:

- `页面标题`
- `核心内容`
- `建议展示方式`

Prefer concise but information-rich bullets. Prioritize material that is especially presentation-worthy:

- formulas
- model structures
- algorithms
- workflows
- datasets
- experiment settings
- tables and figures
- quantitative results
- case analysis

## Recommended 10-Page Structure

Use this as the default structure and adapt the page titles only when the source clearly calls for it.

### Page 1: Cover

- Include document title, author or source, and the report topic.
- Any missing author or source detail must be labeled `原文未明确说明`.

### Page 2: Research Background / Document Background

- Explain the source's background, field context, problem context, and why the topic matters.

### Page 3: Research Problem / Core Objective

- Clarify the core problem, target, known pain points, and practical meaning.

### Page 4: Overall Idea / Technical Route

- Present the overall framework, pipeline, or logical chain.

### Page 5: Core Method One

- Extract the first major method, module, mechanism, or theoretical pillar.

### Page 6: Core Method Two

- Extract the second major method or a key module breakdown.
- If the source has only one core method, turn this page into `关键模块拆解` or `方法细节分析`.

### Page 7: Experiment Design / Case Analysis / Result Display

- Use this for datasets, evaluation settings, case sources, experiment design, or comparable evidence.
- If there is no experiment, convert this page into `案例分析` or `文档内容验证`.

### Page 8: Result Analysis / Key Findings

- Separate direct source conclusions from source-based synthesis.

### Page 9: Innovation / Contribution / Value Summary

- If the source explicitly states innovations or contributions, use them.
- If not, cautiously summarize them and mark the phrasing as `基于原文归纳`.

### Page 10: Summary And Outlook

- Cover contribution, conclusion, limitations, and future work.
- If limitations or outlook are not clearly stated, label them `原文未明确说明`.

## Source Verification Section

At the end of `ppt_outline.md`, add `资料来源核对说明` with all of the following:

1. A statement that the outline content comes from the uploaded or provided document.
2. A page-by-page mapping to source chapters, sections, figures, tables, experiments, or key paragraphs.
3. Notes explaining when a page is a structured summary rather than a direct restatement, together with the source basis.
4. A statement that no external source was used unless the user explicitly requested it.
5. Explicit `原文未明确说明` notes wherever the source was insufficient.

## Response Contract

When the user says not to print the full outline in chat, keep the final reply short. The preferred reply is:

- `已生成 ppt_outline.md`
- `文件中包含约 10 页 PPT 大纲`
- `内容严格基于上传文档`
