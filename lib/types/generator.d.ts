/** Component-library renderer for native editable PowerPoint objects. */
import type { OfficeDesignSpec, OfficeLayoutId, OfficeSlide, OfficeSlidePlan, OfficeTemplate } from './protocol.ts';
type FontClass = 'deck-title' | 'slide-title' | 'callout' | 'body' | 'annotation';
/** Geometry retained for deterministic page QA. */
export interface GeneratedElementEvidence {
    readonly id: string;
    readonly kind: 'text' | 'shape' | 'chart';
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly fontSize?: number;
    readonly fontClass?: FontClass;
    readonly collision: boolean;
    readonly group: string;
}
/** One rendered page's native object and geometry evidence. */
export interface GeneratedPageEvidence {
    readonly slideId: OfficeSlide['id'];
    readonly layout: OfficeLayoutId;
    readonly width: number;
    readonly height: number;
    readonly nativeObjectCount: number;
    readonly elements: readonly GeneratedElementEvidence[];
}
/** Native output plus independently inspectable page evidence. */
export interface GeneratedPresentation {
    readonly bytes: Uint8Array;
    readonly nativeObjectCount: number;
    readonly pages: readonly GeneratedPageEvidence[];
}
/**
 * Produce a native PPTX from independently inspectable story/design/layout artifacts.
 * @param title - Presentation title stored in the PPTX metadata.
 * @param template - Selected theme, typography, and visual grammar.
 * @param slides - Planned editable slide models.
 * @param design - Deck-wide visual constraints.
 * @param plan - Page-level registered layout plan.
 * @returns Native PPTX bytes and inspectable page evidence.
 */
export declare function generatePresentation(title: string, template: OfficeTemplate, slides: readonly OfficeSlide[], design: OfficeDesignSpec, plan: readonly OfficeSlidePlan[]): Promise<GeneratedPresentation>;
export {};
//# sourceMappingURL=generator.d.ts.map