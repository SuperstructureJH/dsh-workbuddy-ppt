/** Operator-staged presentation design-system parser and Skill provider. */
import type { Context } from '@deepseek-ai/cordis';
export declare const PPT_DESIGN_SYSTEMS_SKILL_NAME = "ppt-design-systems";
declare const VISUAL_CATEGORIES: readonly ["academic", "consulting", "finance", "promotion", "work"];
type DesignSystemCategory = typeof VISUAL_CATEGORIES[number];
/** One parsed operator-staged style exposed as a virtual Skill. */
export interface PptDesignSystemStyle {
    readonly category: DesignSystemCategory;
    readonly slug: string;
    readonly skillName: string;
    readonly title: string;
    readonly signature: string;
    readonly content: string;
    readonly sourcePath: string;
    readonly referenceImagePath?: string;
}
/** Validated local library used by one provider instance. */
export interface PptDesignSystemLibrary {
    readonly root: string;
    readonly styles: readonly PptDesignSystemStyle[];
}
/**
 * Parse operator-provided Kimi design-system bundles without executing their instructions.
 * @param sources - Exact local Markdown paths and bytes admitted by the host configuration.
 * @returns Validated styles in category and source order.
 */
export declare function parsePptDesignSystemSources(sources: readonly {
    readonly sourcePath: string;
    readonly content: string;
}[]): readonly PptDesignSystemStyle[];
/**
 * Load either the five-category visual library or the legacy three-file library.
 * @param root - Directory containing five category folders or the legacy category Markdown files.
 * @returns Parsed library ready for provider registration.
 */
export declare function loadPptDesignSystemLibrary(root: string): Promise<PptDesignSystemLibrary>;
/**
 * Register one validated local design-system catalog and its virtual style Skills.
 * @param ctx - Cordis context that owns the Skill registry.
 * @param library - Parsed operator-staged library.
 */
export declare function registerPptDesignSystems(ctx: Context, library: PptDesignSystemLibrary): void;
export {};
//# sourceMappingURL=design-system-skill.d.ts.map