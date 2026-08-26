/** Host entry for the installable experimental Office PPT bundle. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin identity. */
export declare const name = "workbuddy-ppt";
/** Required host services. */
export declare const inject: string[];
/** Local storage and resource ceilings. */
export interface Config {
    /** Absolute local root for state, revisions, and audit. */
    root: string;
    /** Maximum decoded bytes accepted from one browser upload. */
    maxUploadBytes?: number;
    /** Maximum member count accepted from one OOXML archive. */
    maxZipEntries?: number;
    /** Maximum expanded bytes accepted from one archive member. */
    maxZipEntryBytes?: number;
    /** Maximum aggregate expanded bytes accepted from one archive. */
    maxUncompressedBytes?: number;
    /** Maximum slides accepted in one generated presentation. */
    maxSlides?: number;
    /** Maximum persisted presentations in one DSH session. */
    maxDecksPerSession?: number;
    /** Maximum extracted templates in one DSH session. */
    maxTemplatesPerSession?: number;
    /** Maximum recent activity records retained in session state. */
    maxActivities?: number;
    /** Absolute root populated by the WorkBuddy runtime staging command. */
    workbuddyRuntimeRoot?: string;
    /** Fail plugin loading when staged WorkBuddy artifacts are absent. */
    requireWorkbuddyRuntime?: boolean;
    /** Node executable used for the trusted SlideP package. */
    workbuddyNodeExecutable?: string;
    /** First loopback port considered for the Tencent Docs editor engine. */
    workbuddyPreferredPort?: number;
    /** Number of consecutive loopback ports considered. */
    workbuddyPortScanAttempts?: number;
    /** Tencent Docs engine readiness ceiling in milliseconds. */
    workbuddyReadinessTimeoutMs?: number;
    /** Per-page SlideP validation ceiling in milliseconds. */
    workbuddyValidationTimeoutMs?: number;
    /** Complete SlideP first-sync ceiling in milliseconds. */
    workbuddyRenderTimeoutMs?: number;
    /** SIGTERM grace before managed subprocess escalation. */
    workbuddySubprocessGraceMs?: number;
    /** Bounded diagnostic output retained from each trusted subprocess. */
    workbuddyOutputMaxBytes?: number;
    /** Number of page validators allowed to overlap. */
    workbuddyValidationConcurrency?: number;
    /** Explicit browser origins accepted by editor_sdk. Empty uses its bundled defaults. */
    workbuddyEditorCorsOrigins?: string[];
    /** Maximum UTF-8 bytes accepted from one model-authored JSX page. */
    workbuddyMaxJsxBytesPerPage?: number;
    /** Maximum bytes accepted from STORY.md. */
    workbuddyMaxStoryBytes?: number;
    /** Maximum bytes accepted from DESIGN.md. */
    workbuddyMaxDesignBytes?: number;
    /** Maximum bytes copied from one reviewed workspace image. */
    workbuddyMaxAssetBytes?: number;
    /** Maximum aggregate bytes copied from reviewed workspace images. */
    workbuddyMaxTotalAssetBytes?: number;
    /** Absolute first-party WorkBuddy PPT Skill override. The package-bundled Skill is the default. */
    workbuddyPptSkillRoot?: string;
    /** Absolute staged root containing academic.md, promotion.md, and work.md. */
    pptDesignSystemRoot?: string;
}
/** Loader schema with conservative local defaults. */
export declare const Config: z<Config>;
/** Compose storage, browser RPC, and approved model tools. */
export declare function apply(ctx: Context, config: Config): Promise<void>;
export type { OfficePptService } from './service.ts';
export * from './protocol.ts';
//# sourceMappingURL=index.d.ts.map