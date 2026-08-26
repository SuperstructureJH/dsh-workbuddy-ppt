/** Managed WorkBuddy SlideP and Tencent Docs editor runtime adapter. */
import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
/** MIME type used for editable OOXML PowerPoint outputs. */
declare const PPTX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
/** Runtime and resource ceilings owned by the Office PPT plugin. */
export interface WorkBuddyRuntimeOptions {
    readonly runtimeRoot: string;
    readonly nodeExecutable: string;
    readonly slidepValidateEntrypoint: string;
    readonly slidepStartEntrypoint: string;
    readonly editorSdkBinary: string;
    readonly preferredPort: number;
    readonly portScanAttempts: number;
    readonly readinessTimeoutMs: number;
    readonly validationTimeoutMs: number;
    readonly renderTimeoutMs: number;
    readonly subprocessGraceMs: number;
    readonly outputMaxBytes: number;
    readonly validationConcurrency: number;
    readonly editorCorsOrigins: readonly string[];
}
/** Parsed result emitted by one SlideP validation subprocess. */
export interface WorkBuddyPageValidation {
    readonly fileName: string;
    readonly id: string;
    readonly status: string;
    readonly totalResources: number;
    readonly doneResources: number;
    readonly pendingResources: number;
    readonly imagePlaceholders: readonly string[];
}
/** Complete render evidence returned to the application service. */
export interface WorkBuddyRenderResult {
    readonly outputPath: string;
    readonly slidepVersion: string;
    readonly fileId: string;
    readonly validations: readonly WorkBuddyPageValidation[];
    readonly bytes: Uint8Array;
}
/** Owns the trusted runtime processes while keeping model-authored JSX on a declarative boundary. */
export declare class WorkBuddyPptRuntime {
    private readonly subprocess;
    readonly options: WorkBuddyRuntimeOptions;
    private engine;
    private engineStarting;
    private readonly workers;
    private disposed;
    constructor(subprocess: SubprocessRuntime, options: WorkBuddyRuntimeOptions);
    /**
     * Return whether all externally staged runtime artifacts are readable.
     * @returns True when every required executable and SlideP entrypoint is available.
     */
    available(): Promise<boolean>;
    /** Fail with one staging-oriented error before a render mutates plugin storage. */
    assertAvailable(): Promise<void>;
    /**
     * Validate every page, render it through SlideP, save the PPTX, and retain the editor engine for preview.
     * @param projectDirectory - Store-derived SlideP project directory.
     * @param outputFileName - Safe output name created by the Office PPT service.
     * @param pageFileNames - Ordered page files already accepted by the static JSX gate.
     * @param signal - Cancellation signal for validation and rendering.
     * @returns Saved output bytes and page-level runtime evidence.
     */
    render(projectDirectory: string, outputFileName: string, pageFileNames: readonly string[], signal: AbortSignal): Promise<WorkBuddyRenderResult>;
    /** Terminate every owned worker and the shared editor engine and await process-tree quiescence. */
    dispose(): Promise<void>;
    private validatePage;
    private ensureEngine;
    private startEngine;
    private waitForEngine;
    private waitForFirstSync;
    private availablePort;
}
export { PPTX_MEDIA_TYPE };
//# sourceMappingURL=workbuddy-runtime.d.ts.map