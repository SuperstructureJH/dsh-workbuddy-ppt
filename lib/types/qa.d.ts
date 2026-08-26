/** Deterministic page-level QA for planned native presentations. */
import type { GeneratedPageEvidence } from './generator.ts';
import type { OfficeDesignSpec, OfficeQaReport, OfficeSlide, OfficeSlidePlan } from './protocol.ts';
/**
 * Validate page geometry, content capacity, sources, and native-object evidence.
 * @param input - Planned slides, layouts, design constraints, and render evidence.
 * @returns Deck-level QA report with page findings.
 */
export declare function qaPresentation(input: {
    readonly slides: readonly OfficeSlide[];
    readonly plan: readonly OfficeSlidePlan[];
    readonly design: OfficeDesignSpec;
    readonly pages: readonly GeneratedPageEvidence[];
}): OfficeQaReport;
/**
 * Create a migration marker for an older persisted revision that predates page QA.
 * @param checkedAt - Stable timestamp inherited from the persisted revision.
 * @returns Explicit not-run QA report.
 */
export declare function notRunQa(checkedAt: string): OfficeQaReport;
//# sourceMappingURL=qa.d.ts.map