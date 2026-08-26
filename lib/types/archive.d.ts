/** Bounded OOXML archive access shared by PPTX and DOCX extraction. */
import { type Unzipped } from 'fflate';
/** Archive limits resolved from the plugin configuration. */
export interface ArchiveLimits {
    readonly maxZipEntries: number;
    readonly maxZipEntryBytes: number;
    readonly maxUncompressedBytes: number;
}
/**
 * Fail a non-OOXML or oversized archive before selected entries are inflated.
 * @param bytes - Uploaded OOXML archive bytes.
 * @param limits - Expansion and entry ceilings.
 * @param select - Predicate for members needed by the caller.
 * @returns Inflated bytes for the selected members.
 */
export declare function readArchive(bytes: Uint8Array, limits: ArchiveLimits, select: (path: string) => boolean): Unzipped;
/**
 * Decode one selected XML member.
 * @param entries - Selected archive members.
 * @param path - Exact archive member path.
 * @returns UTF-8 XML, or an empty string for a missing member.
 */
export declare function xml(entries: Unzipped, path: string): string;
/**
 * Convert basic XML entities in OOXML text nodes.
 * @param value - Encoded OOXML text.
 * @returns Decoded text.
 */
export declare function decodeXmlText(value: string): string;
/**
 * Extract text nodes from WordprocessingML or PresentationML.
 * @param source - OOXML source text.
 * @returns Ordered non-empty text values.
 */
export declare function textNodes(source: string): string[];
/**
 * Order OOXML numbered members numerically rather than lexicographically.
 * @param paths - Archive member paths.
 * @param pattern - Pattern whose first capture is the member number.
 * @returns Paths in numeric order.
 */
export declare function numberedPaths(paths: readonly string[], pattern: RegExp): string[];
//# sourceMappingURL=archive.d.ts.map