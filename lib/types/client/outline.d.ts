/** Browser-only outline helpers. */
import type { OfficeCreateInput, OfficeOutlineDraft, OfficeSlide } from '../protocol.ts';
/**
 * Build the starter structure shown before a file is extracted.
 * @returns Editable deck title and slides.
 */
export declare function starterOutline(): Pick<OfficeCreateInput, 'title' | 'slides'>;
/**
 * Replace the current editor with a host-extracted draft.
 * @param draft - Host-validated outline draft.
 * @returns Editable deck title and slides.
 */
export declare function fromDraft(draft: OfficeOutlineDraft): Pick<OfficeCreateInput, 'title' | 'slides'>;
/**
 * Serialize a host-extracted outline into bounded, human-readable composer context.
 * Uploaded document text is framed as source material; the user's live request remains authoritative.
 * @param draft - Host-validated outline and extraction evidence.
 * @returns Composer text that the existing model/tool route can consume.
 */
export declare function referencePrompt(draft: OfficeOutlineDraft): string;
/**
 * Append one extracted reference without replacing the selected template or the user's request.
 * @param current - Current composer text.
 * @param draft - Host-validated outline draft.
 * @returns Composer text with one bounded reference section.
 */
export declare function appendReferencePrompt(current: string, draft: OfficeOutlineDraft): string;
/**
 * Apply an immutable field update to one draft slide.
 * @param slides - Current draft slides.
 * @param index - Zero-based slide index.
 * @param patch - Fields to replace.
 * @returns Updated draft slides.
 */
export declare function updateDraftSlide(slides: readonly Omit<OfficeSlide, 'id'>[], index: number, patch: Partial<Omit<OfficeSlide, 'id'>>): readonly Omit<OfficeSlide, 'id'>[];
//# sourceMappingURL=outline.d.ts.map