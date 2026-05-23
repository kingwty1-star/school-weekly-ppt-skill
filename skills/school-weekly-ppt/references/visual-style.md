# Visual Style For School Weekly PPT

## Overall Direction

Use a formal blue technical-report style. The deck should feel like a weekly academic/project progress report, not a generic template.

Core palette:

- Deep navy `#0B2E4A`: titles, major conclusions, dark closing slide.
- Report blue `#1F5F99`: module headings, arrows, main paths.
- Light blue `#DDEBFA`: information cards and section backgrounds.
- Ice blue `#F3F8FF`: page background.
- Cyan `#23A6D5`: limited accent for key variables, triggers, or innovations.
- Ink `#263238`: body text.
- Muted gray `#6C7A89`: secondary notes.
- Warm amber `#F6B44B`: rare contrast for warnings, thresholds, or leakage terms.

Use `Microsoft YaHei` for Chinese. Use a clean Latin font such as `Aptos` for variable labels if needed.

## Focus Rules

Each slide needs one primary message. Use size, position, color, and whitespace to make the primary message visible first.

Use strong emphasis only 1-2 times per slide:

- Deep navy blocks for the most important conclusion.
- Cyan outlines or fills for key variables/mechanisms.
- Pale-blue cards for supporting content.
- Smaller gray text for captions and caveats.

Avoid equal-weight grids where every item competes with the key point.

## Recommended 8-Slide Structure

1. Cover: week, learning topic, domain chips, and a simple signal/system visual.
2. Core progress: three achievement cards and one summary sentence.
3. Learning path: input/materials -> framework/code -> mechanism -> output.
4. Weekly detail: timeline, loop, or decomposition of the main work.
5. Key mechanism: formula/model/algorithm principle diagram.
6. Knowledge map: variable flow, concept chain, or module relationship.
7. Corrections/reflection: misunderstanding -> clarified understanding.
8. Next week: 3-4 concrete actions and a closing target.

## Principle Diagram Rules

The key mechanism slide must explain physical meaning. It is not enough to paste a formula or label variables.

Do:

- Put variables on the physical object, signal, state, or action they represent.
- Use arrows to show real relationships: signal transfer, state update, error calculation, control output, threshold decision, or adaptation.
- Use shaded distance/area to express error, threshold bands, constraint regions, cost regions, or compensation ranges.
- Split formula terms into visual components. For example, `z1 = xHat1 - yd` should show the gap between the estimated output trajectory and the reference trajectory.
- Show the key innovation or key mechanism with the strongest visual hierarchy.

Avoid:

- Copying formulas as decoration.
- Using arrows that do not encode direction, causality, or update relationships.
- Using shadows only as background decoration.
- Making the mechanism slide a dense text slide.

## Helpful Visual Metaphors

For coding/simulation reports:

- Pipeline cards for function calls or data flow.
- Timeline axis for simulation loops.
- Signal curves for reference/output tracking.
- Gate/decision block for event-triggered updates.
- Before/after rows for corrected misunderstandings.

For formula/model reports:

- State box -> error gap -> compensator -> controller -> output.
- Threshold band with shaded no-update region and highlighted trigger region.
- Energy/parameter flow band for adaptive laws.

## QA Standard

Render every slide before final delivery. Inspect at contact-sheet scale and at least the key mechanism slide at full size. Fix unreadable Chinese, text overflow, cluttered arrows, or weak hierarchy before handing off.
