/** Safe PPTX theme, typography, and bounded slide-geometry extraction. */
import type { Unzipped } from 'fflate';
import type { ArchiveLimits } from './archive.ts';
import { type OfficeTemplate } from './protocol.ts';
/**
 * Whether one PPTX archive member contributes to native template analysis.
 * @param path - Root-relative member path inside the PPTX ZIP package.
 * @returns True when the member is required for layout and theme analysis.
 */
export declare function isTemplateArchiveMember(path: string): boolean;
/**
 * Derive a reusable native template from already validated PPTX members.
 * @param bytes - Original PPTX bytes retained for source identity.
 * @param fileName - Original file name retained as evidence.
 * @param selected - Template-analysis archive members.
 * @returns Reusable theme, typography, and bounded slide-pattern facts.
 */
export declare function extractTemplateFromArchive(bytes: Uint8Array, fileName: string, selected: Unzipped): OfficeTemplate;
/**
 * Derive a reusable native-generation template from a bounded PPTX upload.
 * @param bytes - Uploaded PPTX bytes.
 * @param fileName - Original file name retained as evidence.
 * @param limits - OOXML expansion ceilings.
 * @returns Reusable theme, typography, and bounded slide-pattern facts.
 */
export declare function extractTemplate(bytes: Uint8Array, fileName: string, limits: ArchiveLimits): OfficeTemplate;
//# sourceMappingURL=extract-template.d.ts.map