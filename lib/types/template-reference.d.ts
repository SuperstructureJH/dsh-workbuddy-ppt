/** Kimi-style visual-reference projection for shared presentation templates. */
import type { OfficeTemplate } from './protocol.ts';
/** One visual evidence asset derived from the canonical template source. */
export interface OfficeTemplateVisualReference {
    readonly kind: 'contact-sheet' | 'semantic-profile';
    readonly designProfile: string;
    readonly representativeSlides: readonly number[];
    readonly pages?: readonly {
        readonly slideNumber: number;
        readonly fileName: string;
        readonly mediaType: 'image/jpeg';
        readonly bytes: Uint8Array;
    }[];
}
/**
 * Build the PPT visual-reference projection for one shared catalog template.
 * Templates without a raster pack still expose their stable semantic profile.
 */
export declare function loadTemplateVisualReference(template: OfficeTemplate): Promise<OfficeTemplateVisualReference>;
//# sourceMappingURL=template-reference.d.ts.map