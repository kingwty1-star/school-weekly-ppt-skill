# Visual Style For Zhoubao PPT

Use this reference whenever the user provides a PPT outline and asks for a full visual scheme, page-preview board, multi-page thumbnails, or a graduation-defense style direction.

## Output Contract

- Produce the visual result directly.
- Do not output design advice, code, markdown, or analytical prose when the user explicitly asks for visual-only output.
- Represent the result as full-page previews, a thumbnail contact sheet, or another clearly multi-slide visual board.
- Base every page on the provided outline only. Do not add outside content.

## Style Direction

The deck should feel:

- formal
- professional
- academic
- concise
- stable
- suitable for a graduation defense
- suitable for science and engineering reporting

Avoid startup-marketing aesthetics, entertainment styling, excessive gradients, neon colors, or decorative clutter.

## Color System

Use a restrained cool palette centered on:

- light gray backgrounds
- deep navy titles and high-priority blocks
- cyan blue accents for key highlights

Recommended values:

- deep navy: `#0B2E4A`
- report blue: `#1F5F99`
- cyan blue: `#23A6D5`
- light gray blue: `#DDEBFA`
- pale background: `#F3F8FF`
- body text ink: `#263238`
- secondary gray: `#6C7A89`

## Layout System

Keep the page system unified:

- strong title band or top-left title anchor
- clear primary content area
- consistent margins and spacing
- repeatable section labels and card styles
- consistent captions, tags, and data emphasis

Information should feel full but not crowded. The first glance should reveal the page's main message.

## Page Coverage

When building a complete preview system, make sure the page family covers the common academic-defense flow:

- cover
- table of contents or structure overview
- background
- research problem or objective
- method or technical route
- experiment or case setup
- result analysis
- contribution or innovation summary
- conclusion and outlook
- acknowledgements or closing page when appropriate

If the provided outline already defines a different 8-10 page structure, preserve that structure while keeping the same visual language.

## Diagram And Chart Rules

Charts, flowcharts, tables, and process diagrams should look like they belong to the same deck:

- consistent line weights
- consistent corner radius
- consistent label style
- limited accent colors
- clear grouping
- readable contrast

For method pages, prefer structured blocks, arrows, step cards, and technical-route diagrams over decorative illustrations.

For result pages, prefer bar charts, line charts, comparison tables, metric cards, or annotated findings panels that can realistically belong to an engineering defense.

## Text And Hierarchy

- Keep headings explicit and academic.
- Use short labels and layered typography.
- Do not fill the previews with placeholder lorem ipsum.
- Use real section names and condensed bullets derived from the outline.
- Keep one dominant takeaway per page, with secondary details in smaller support areas.

## Final Rendering Rule

The final result should feel like a complete visual proposal for the whole deck, not a list of suggestions. If the user says `只输出视觉结果`, return only the generated image output.
