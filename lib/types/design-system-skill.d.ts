/** Operator-staged presentation design-system parser and Skill provider. */
import type { Context } from '@deepseek-ai/cordis';
export declare const PPT_DESIGN_SYSTEMS_SKILL_NAME = "ppt-design-systems";
declare const EXPECTED_CATEGORIES: readonly ["academic", "promotion", "work"];
type DesignSystemCategory = typeof EXPECTED_CATEGORIES[number];
/** One parsed operator-staged style exposed as a virtual Skill. */
export interface PptDesignSystemStyle {
    readonly category: DesignSystemCategory;
    readonly slug: string;
    readonly skillName: string;
    readonly title: string;
    readonly signature: string;
    readonly content: string;
    readonly sourcePath: string;
}
/** Validated three-category library used by one provider instance. */
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
 * Load the three exact staged category files from one absolute directory.
 * @param root - Directory containing academic.md, promotion.md, and work.md.
 * @returns Parsed library ready for provider registration.
 */
export declare function loadPptDesignSystemLibrary(root: string): Promise<PptDesignSystemLibrary>;
/**
 * Register one validated local design-system catalog and its 18 virtual style Skills.
 * @param ctx - Cordis context that owns the Skill registry.
 * @param library - Parsed operator-staged library.
 */
export declare function registerPptDesignSystems(ctx: Context, library: PptDesignSystemLibrary): void;
export {};
//# sourceMappingURL=design-system-skill.d.ts.map