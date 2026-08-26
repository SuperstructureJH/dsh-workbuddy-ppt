/** Canonical OOXML package normalization shared by generation and browser preview. */
/**
 * Move SlideP chart parts from its slide-local package directory into the
 * canonical PresentationML chart directory and rewrite every owning
 * relationship. PowerPoint accepts both locations; browser renderers follow
 * the canonical package layout.
 * @param bytes - Complete generated PPTX package.
 * @returns Original bytes when no SlideP layout is present, otherwise a canonical package.
 */
export declare function normalizeSlidepChartParts(bytes: Uint8Array): Uint8Array;
//# sourceMappingURL=pptx-package.d.ts.map