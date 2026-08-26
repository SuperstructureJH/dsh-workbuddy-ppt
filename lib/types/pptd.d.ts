/** Clean-room PPTD v2 parser, checker, loader, and native editable PPTX renderer. */
type Dict = Record<string, unknown>;
/** One in-memory local resource available to a PPTD project. */
export interface PptdAsset {
    readonly path: string;
    readonly mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml';
    readonly bytes: Uint8Array;
    readonly sha256: string;
}
/** Multi-file PPTD source plane. Paths are project-root-relative. */
export interface PptdProjectSource {
    readonly entryName: string;
    readonly manifest: string;
    readonly pages: ReadonlyMap<string, string>;
    readonly assets: ReadonlyMap<string, PptdAsset>;
}
/** One normalized PPTD diagnostic. */
export interface PptdIssue {
    readonly code: string;
    readonly severity: 'warning' | 'error';
    readonly message: string;
    readonly file?: string;
    readonly page?: number;
    readonly elementId?: string;
}
/** Deterministic evidence returned by the PPTD checker. */
export interface PptdCheck {
    readonly status: 'pass' | 'warning' | 'fail';
    readonly digest: string;
    readonly pageCount: number;
    readonly nativeObjectCount: number;
    readonly warningCount: number;
    readonly errorCount: number;
    readonly issues: readonly PptdIssue[];
}
/** Parsed PPTD project retained as a normalized, renderer-independent AST. */
export interface PptdProject {
    readonly source: PptdProjectSource;
    readonly title: string;
    readonly width: number;
    readonly height: number;
    readonly theme: Dict;
    readonly pages: readonly PptdPage[];
    readonly parseIssues: readonly PptdIssue[];
}
/** One parsed PPTD page. */
export interface PptdPage {
    readonly file: string;
    readonly pageType?: string;
    readonly background?: Dict;
    readonly notes: string;
    readonly elements: readonly Dict[];
}
/** Native editable PPTX generated from a checked PPTD AST. */
export interface RenderedPptd {
    readonly bytes: Uint8Array;
    readonly nativeObjectCount: number;
    readonly check: PptdCheck;
}
/** Parse a bounded in-memory PPTD v2 project into a renderer-independent AST. */
export declare function parsePptdProject(source: PptdProjectSource): PptdProject;
/** Check a parsed PPTD project without writing files or executing external code. */
export declare function checkPptdProject(project: PptdProject): PptdCheck;
/** Render one checked PPTD AST to editable native PowerPoint objects. */
export declare function renderPptdProject(project: PptdProject): Promise<RenderedPptd>;
/** Load a confined local PPTD project. Network resources stay disabled. */
export declare function loadPptdProject(entryPath: string): Promise<PptdProject>;
export {};
//# sourceMappingURL=pptd.d.ts.map