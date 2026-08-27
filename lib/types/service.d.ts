/** Application service coordinating validation, generation, persistence, and audit. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ArchiveLimits } from './archive.ts';
import { type OfficeCreateInput, type OfficeDeck, type OfficeDeckPreview, type OfficeDownload, type OfficeOutlineDraft, type OfficeOutputLocation, type OfficePptState, type OfficePresentationMode, type OfficeTemplate, type OfficePptSceneCheck, type OfficePptSceneInput, type OfficeTemplatePageReference, type OfficeUpdateSlideInput, type OfficeUploadInput, type OfficeWorkBuddyCreateInput } from './protocol.ts';
import { OfficePptStore } from './store.ts';
import type { WorkBuddyPptRuntime } from './workbuddy-runtime.ts';
/** Host-side limits that bound every extraction and generated document. */
export interface OfficePptLimits extends ArchiveLimits {
    readonly maxUploadBytes: number;
    readonly maxSlides: number;
}
/** Model-authored project and workspace-asset ceilings for the WorkBuddy renderer. */
export interface OfficeWorkBuddyLimits {
    readonly maxJsxBytesPerPage: number;
    readonly maxStoryBytes: number;
    readonly maxDesignBytes: number;
    readonly maxAssetBytes: number;
    readonly maxTotalAssetBytes: number;
}
/** Attributed caller crossing the browser or model boundary. */
export interface OfficeActor {
    readonly kind: 'user' | 'agent';
}
/** Error with a stable RPC-facing business category. */
export declare class OfficePptError extends Error {
    readonly code: 'invalid-request' | 'not-found' | 'conflict' | 'unsupported' | 'limit-exceeded' | 'operation-failed';
    constructor(code: 'invalid-request' | 'not-found' | 'conflict' | 'unsupported' | 'limit-exceeded' | 'operation-failed', message: string);
}
/** Complete local presentation workflow for browser RPC and model tools. */
export declare class OfficePptService {
    private readonly store;
    private readonly limits;
    private readonly workbuddyRuntime?;
    private readonly workbuddyLimits;
    private readonly locks;
    constructor(store: OfficePptStore, limits: OfficePptLimits, workbuddyRuntime?: WorkBuddyPptRuntime | undefined, workbuddyLimits?: OfficeWorkBuddyLimits);
    /**
     * Read the presentation state visible to one session.
     * @param sessionId - Active DSH session.
     * @returns Persisted templates, decks, and activity records.
     */
    state(sessionId: SessionId): Promise<OfficePptState>;
    /**
     * Read the semantic and SlideP-code index extracted from individual source pages.
     * @param sessionId - Active DSH session.
     * @param templateId - Source-backed template identity.
     * @param slideNumbers - Optional bounded source-page selection; omit for the full semantic catalog.
     * @returns Indexed source pages in source or requested order.
     */
    templatePages(sessionId: SessionId, templateId: string, slideNumbers?: readonly number[]): Promise<readonly OfficeTemplatePageReference[]>;
    /**
     * Read the persisted final-deck projection rendered by the conversation player.
     * @param sessionId - Active DSH session.
     * @param deckId - Persisted presentation identity.
     * @returns Final slide order, content, template, revision, and file name.
     */
    preview(sessionId: SessionId, deckId: string): Promise<OfficeDeckPreview>;
    /**
     * Execute the Tencent skill's STORY → DESIGN → static JSX → validate → render chain.
     * @param sessionId - Active DSH session.
     * @param input - Complete model-authored static project.
     * @param workspaceRoot - Trusted active workspace that may supply reviewed image assets.
     * @param actor - Attributed caller.
     * @param signal - Caller-owned cancellation propagated through every runtime subprocess.
     * @returns Persisted deck and WorkBuddy renderer evidence.
     */
    createWorkBuddyDeck(sessionId: SessionId, input: OfficeWorkBuddyCreateInput, workspaceRoot: string, actor: OfficeActor, signal: AbortSignal): Promise<OfficeDeck>;
    /**
     * Extract an editable outline from one bounded upload.
     * @param sessionId - Active DSH session.
     * @param upload - File name and canonical base64 content.
     * @param actor - Attributed caller.
     * @returns Editable outline with source evidence.
     */
    extractContent(sessionId: SessionId, upload: OfficeUploadInput, actor: OfficeActor): Promise<OfficeOutlineDraft>;
    /**
     * Extract and persist reusable presentation-format facts.
     * @param sessionId - Active DSH session.
     * @param upload - PPTX name and canonical base64 content.
     * @param actor - Attributed caller.
     * @returns Extracted template.
     */
    extractTemplate(sessionId: SessionId, upload: OfficeUploadInput, actor: OfficeActor): Promise<OfficeTemplate>;
    /**
     * Persist the resident composer's template choice without exposing its name in the visible prompt.
     * @param sessionId - Session that owns the composer state.
     * @param templateId - Selected template identifier.
     * @param actor - Audited caller identity.
     * @returns The selected template after the state transition is committed.
     */
    selectTemplate(sessionId: SessionId, templateId: string, actor: OfficeActor, mode?: OfficePresentationMode): Promise<OfficeTemplate>;
    /** Persist the active composer workflow independently from the user's visible draft. */
    selectPresentationMode(sessionId: SessionId, mode: OfficePresentationMode | undefined, actor: OfficeActor): Promise<boolean>;
    /**
     * Clear the resident composer's template choice while keeping PPT mode active.
     * @param sessionId - Session that owns the composer state.
     * @param actor - Audited caller identity.
     * @returns True after the optional selection is removed from persisted state.
     */
    deselectTemplate(sessionId: SessionId, actor: OfficeActor): Promise<boolean>;
    /**
     * Check one declarative PPT scene and bind the result to its workspace-image bytes.
     * @param sessionId - Active DSH session.
     * @param input - Complete declarative scene.
     * @param workspaceRoot - Trusted active workspace that owns referenced images.
     * @param signal - Caller-owned cancellation for workspace reads.
     * @returns Deterministic geometry, text, chart, asset, and collision findings.
     */
    checkScene(sessionId: SessionId, input: OfficePptSceneInput, workspaceRoot: string, signal: AbortSignal): Promise<OfficePptSceneCheck>;
    /**
     * Compile a scene that passed a same-turn hash-bound check into an editable PPTX.
     * @param sessionId - Active DSH session.
     * @param input - Complete declarative scene repeated from the check call.
     * @param expectedSceneHash - Exact hash returned by the successful check.
     * @param workspaceRoot - Trusted active workspace that receives the visible output.
     * @param actor - Attributed caller.
     * @param signal - Caller-owned cancellation for workspace reads.
     * @returns Persisted scene-backed Deck and output evidence.
     */
    createSceneDeck(sessionId: SessionId, input: OfficePptSceneInput, expectedSceneHash: string, workspaceRoot: string, actor: OfficeActor, signal: AbortSignal): Promise<OfficeDeck>;
    /**
     * Generate and persist the first native presentation revision.
     * @param sessionId - Active DSH session.
     * @param input - Validated title, template, and slides.
     * @param workspaceRoot - Trusted active workspace that receives the visible output folder.
     * @param actor - Attributed caller.
     * @returns Persisted deck and output evidence.
     */
    createDeck(sessionId: SessionId, input: OfficeCreateInput, workspaceRoot: string, actor: OfficeActor): Promise<OfficeDeck>;
    /**
     * Update one slide and publish the next immutable revision.
     * @param sessionId - Active DSH session.
     * @param input - Revision-checked focused slide edit.
     * @param workspaceRoot - Trusted active workspace that receives the visible output folder.
     * @param actor - Attributed caller.
     * @returns Updated deck and output evidence.
     */
    updateSlide(sessionId: SessionId, input: OfficeUpdateSlideInput, workspaceRoot: string, actor: OfficeActor): Promise<OfficeDeck>;
    /**
     * Read one generated revision for an explicit browser download.
     * @param sessionId - Active DSH session.
     * @param deckId - Persisted presentation identity.
     * @param actor - Attributed caller.
     * @returns File name, media type, and canonical base64 bytes.
     */
    download(sessionId: SessionId, deckId: string, actor: OfficeActor): Promise<OfficeDownload>;
    /**
     * Resolve one generated revision's file and containing folder for the local Host opener.
     * @param sessionId - Active DSH session.
     * @param deckId - Persisted presentation identity.
     * @param actor - Attributed caller.
     * @returns Persisted file name plus server-validated file and directory paths.
     */
    locate(sessionId: SessionId, deckId: string, actor: OfficeActor): Promise<OfficeOutputLocation>;
    private prepareScene;
    private uploadBytes;
    private assertWorkBuddySources;
    private assertTemplatePageSelections;
    private readWorkspaceAssets;
    private assertReferencedAssets;
    private assertImageBytes;
    private assertQaPassed;
    private mutate;
    private activity;
    private withLock;
}
//# sourceMappingURL=service.d.ts.map