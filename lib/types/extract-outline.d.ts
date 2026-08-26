/** Content-source extraction into the editable presentation outline model. */
import type { Unzipped } from 'fflate';
import type { ArchiveLimits } from './archive.ts';
import type { OfficeOutlineDraft } from './protocol.ts';
/**
 * Build an outline from archive members already validated and inflated by the material pipeline.
 * @param bytes - Original upload bytes retained for source identity.
 * @param fileName - Original file name.
 * @param kind - OOXML source family.
 * @param entries - Selected archive members.
 * @param maxSlides - Maximum editable sections returned.
 * @returns Editable presentation outline with source evidence.
 */
export declare function extractOutlineFromArchive(bytes: Uint8Array, fileName: string, kind: 'pptx' | 'docx', entries: Unzipped, maxSlides: number): OfficeOutlineDraft;
/**
 * Extract PPTX, DOCX, Markdown, or text into an editable draft.
 * @param bytes - Uploaded source bytes.
 * @param fileName - Original file name used to select the parser.
 * @param limits - OOXML expansion ceilings.
 * @returns Editable presentation outline with source evidence.
 */
export declare function extractOutline(bytes: Uint8Array, fileName: string, limits: ArchiveLimits & {
    readonly maxSlides: number;
}): OfficeOutlineDraft;
//# sourceMappingURL=extract-outline.d.ts.map