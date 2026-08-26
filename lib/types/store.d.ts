/** Session-confined persistent state and versioned binary output storage. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { OfficeActivity, OfficeDeck, OfficePptState, OfficeTemplate } from './protocol.ts';
/** Storage ceilings used by the service. */
export interface StoreLimits {
    readonly maxDecksPerSession: number;
    readonly maxTemplatesPerSession: number;
    readonly maxActivities: number;
}
/** Host-validated source files written into one immutable WorkBuddy project. */
export interface WorkBuddyProjectFiles {
    readonly storyMarkdown: string;
    readonly designMarkdown: string;
    readonly pages: readonly {
        readonly fileName: string;
        readonly jsx: string;
    }[];
    readonly assets: readonly {
        readonly fileName: string;
        readonly bytes: Uint8Array;
    }[];
}
/** Kimi PPTD-compatible source, DSH scene evidence, and admitted images published with a deterministic PPT output. */
export interface PptSceneProjectFiles {
    readonly sceneJson: string;
    readonly pptdManifest: string;
    readonly pptdPages: readonly {
        readonly fileName: string;
        readonly content: string;
    }[];
    readonly assets: readonly {
        readonly fileName: string;
        readonly bytes: Uint8Array;
    }[];
}
type WorkspaceProjectFiles = WorkBuddyProjectFiles | PptSceneProjectFiles;
/** Confined WorkBuddy project location derived entirely by the store. */
export interface WorkBuddyProjectLocation {
    readonly directoryPath: string;
    readonly projectStorageKey: string;
    readonly outputFileName: string;
}
/** Local store with generated-only paths and atomic state publication. */
export declare class OfficePptStore {
    private readonly limits;
    /** Absolute plugin storage root. */
    readonly root: string;
    private auditTail;
    constructor(root: string, limits: StoreLimits);
    private sessionDirectory;
    private statePath;
    /**
     * Read one session state and merge current built-in templates.
     * @param sessionId - Active DSH session.
     * @returns Validated session state.
     */
    readState(sessionId: SessionId): Promise<OfficePptState>;
    /**
     * Enforce deck capacity before generation writes an output.
     * @param state - Current session state.
     */
    assertDeckCapacity(state: OfficePptState): void;
    /**
     * Enforce custom-template capacity before persistence.
     * @param state - Current session state.
     * @param template - Extracted template candidate.
     */
    assertTemplateCapacity(state: OfficePptState, template: OfficeTemplate): void;
    /**
     * Atomically publish bounded session state.
     * @param state - Next validated session state.
     */
    writeState(state: OfficePptState): Promise<void>;
    /**
     * Atomically retain one immutable revision and publish its user-facing files in the active workspace.
     * @param sessionId - Active DSH session.
     * @param deck - Identity, title, and revision used for generated names.
     * @param bytes - Generated PPTX bytes.
     * @param workspaceRoot - Trusted active workspace that owns the visible delivery folder.
     * @param projectFiles - Validated WorkBuddy sources included beside the PPTX when present.
     * @returns Private storage identity plus absolute visible-workspace locations.
     */
    writeOutput(sessionId: SessionId, deck: Pick<OfficeDeck, 'id' | 'title' | 'revision'>, bytes: Uint8Array, workspaceRoot: string, projectFiles?: WorkspaceProjectFiles): Promise<{
        storageKey: string;
        fileName: string;
        workspaceDirectoryPath: string;
        workspaceFilePath: string;
    }>;
    /**
     * Atomically publish one static WorkBuddy project below the session directory.
     * @param sessionId - Active DSH session.
     * @param deck - Store-derived project identity and output name.
     * @param files - Validated STORY, DESIGN, JSX, and image bytes.
     * @returns Confined absolute directory plus root-relative evidence key.
     */
    writeWorkBuddyProject(sessionId: SessionId, deck: Pick<OfficeDeck, 'id' | 'title' | 'revision'>, files: WorkBuddyProjectFiles): Promise<WorkBuddyProjectLocation>;
    /**
     * Read a generated output confined below the plugin root.
     * @param storageKey - Root-relative persisted output key.
     * @returns Generated PPTX bytes.
     */
    readOutput(storageKey: string): Promise<Uint8Array>;
    /**
     * Resolve the containing directory for a persisted output.
     * @param storageKey - Root-relative persisted output key from session state.
     * @returns Absolute generated-output directory for the Host path opener.
     */
    outputDirectory(storageKey: string): string;
    /**
     * Resolve a persisted output for trusted host integrations such as the local editor runtime.
     * @param storageKey - Root-relative persisted output key from session state.
     * @returns Absolute path to the stored PPTX output.
     */
    outputPath(storageKey: string): string;
    /**
     * Remove an unpublished failed WorkBuddy project using its store-derived key.
     * @param projectStorageKey - Root-relative project key created by this store.
     */
    removeWorkBuddyProject(projectStorageKey: string): Promise<void>;
    private resolveOutput;
    /**
     * Append one completed or failed operation to the shared audit ledger.
     * @param sessionId - Active DSH session.
     * @param activity - Attributed operation record.
     * @param facts - Optional presentation and template identities.
     */
    appendAudit(sessionId: SessionId, activity: OfficeActivity, facts: {
        readonly deckId?: string;
        readonly templateId?: string;
    }): Promise<void>;
    /**
     * Replace or append one extracted template in session state.
     * @param state - Current session state.
     * @param template - Extracted template to persist.
     * @returns State with the template applied.
     */
    withTemplate(state: OfficePptState, template: OfficeTemplate): OfficePptState;
    private publishWorkspaceOutput;
    private writeNewFile;
    private writeVisibleFile;
}
export {};
//# sourceMappingURL=store.d.ts.map