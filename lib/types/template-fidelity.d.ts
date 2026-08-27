/** Deterministic visual preflight for model-authored SlideP pages using source-backed templates. */
import { type OfficePalette, type OfficePptScenePage, type OfficeTemplatePageReference } from './protocol.ts';
/** Stable input error raised when a generated page breaks an indexed source-page visual relationship. */
export declare class TemplateFidelityError extends Error {
    constructor(message: string);
}
/**
 * Enforce local inverse text and source-page primary-visual scale before renderer execution.
 * @param fileName - JSX page file name used in a precise diagnostic.
 * @param source - Complete static SlideP JSX source for the page.
 * @param reference - Selected source-template page contract, when present.
 * @param palette - Selected template colors used to retain its accent regions.
 */
export declare function assertTemplateVisualFidelity(fileName: string, source: string, reference?: OfficeTemplatePageReference, palette?: OfficePalette): void;
/**
 * Enforce one source-template page's measured visual relationships on a declarative PPT scene page.
 * @param pageNumber - One-based output page number used in diagnostics.
 * @param page - Declarative page authored for the PPTD workflow.
 * @param canvasWidth - Active PowerPoint canvas width in inches.
 * @param reference - Source-template page selected for this output page.
 * @param palette - Selected template colors whose accent placement remains authoritative.
 */
export declare function assertSceneTemplateVisualFidelity(pageNumber: number, page: OfficePptScenePage, canvasWidth: number, reference: OfficeTemplatePageReference, palette: OfficePalette): void;
//# sourceMappingURL=template-fidelity.d.ts.map