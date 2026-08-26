---
name: ppt-template-fidelity
description: Apply a source PPTX template's visual hierarchy, foreground/background color relationships, and proportional layout when generating or reviewing template-based slides.
---

# PPT Template Fidelity

Treat each selected source page as a relational visual contract. Preserve the majority of its semantic layout landmarks: title and content groups, primary visuals, major filled regions, local color pairings, and hierarchy. Raw primitive count is irrelevant.

## Apply the source page

- Match the output page's narrative job to a source page whose family, features, and primary visual support that job.
- Read and apply the page's simplification guidance. Record the source page number, selection reason, chosen simplification, primary visual type and anchor, canvas share, inverse-text regions, supporting zones, and retained structure in DESIGN.md.
- Keep the primary chart, table, or image as the largest content element and retain its source-side placement. Keep metric cards and explanatory blocks secondary.
- Reuse each filled region's foreground/background relationship. Dark filled regions use the source page's light inverse text; light regions use the template's body and muted colors.
- Preserve the source silhouette, margins, column balance, spacing rhythm, typography roles, shape treatment, and selected-template accent regions. Keep meaningful landmarks in their source-side areas.
- Fit changed content by shortening copy and consolidating repeated explanations inside inherited regions. Select a more suitable source page when the content requires a larger structural change.

## Compare before generation

Compare every authored page with its selected source-page reference across four dimensions:

1. Overall silhouette and grouping: the same major regions, columns, and reading sequence remain recognizable.
2. First-read hierarchy: the title, primary chart/table/image, and supporting explanation keep their relative visual weight.
3. Color relationships: selected-template accent regions and dark-fill inverse text retain the source foreground/background logic.
4. Content fit: the new content reads naturally inside the inherited composition without crowding, orphaned labels, or decorative padding.

Correct an unreasonable dimension by editing an existing meaningful region or selecting another source page. Blank Boxes, duplicated decoration, and primitive-count padding do not improve fidelity.

The Office PPT Host checks weighted semantic layout landmarks, selected-template accent regions, dark-fill text polarity, and the selected source page's primary chart, table, or image share before renderer execution. Empty Boxes and repeated decoration are excluded from the landmark score. Correct the reported JSX page and resubmit the complete project.

## Boundary

This Skill preserves indexed page-level visual grammar. Exact PowerPoint master, animation, and complex drawing fidelity require separate native-template acceptance.
