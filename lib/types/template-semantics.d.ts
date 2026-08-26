/** Template-page visual relationships shared by extraction, persisted-state migration, and model references. */
import type { OfficeTemplate } from './protocol.ts';
/**
 * Apply current relational template semantics to built-in and persisted custom templates.
 * @param template - Template whose indexed source pages require visual enrichment.
 * @returns The template with relational page semantics populated.
 */
export declare function enrichTemplateVisualSemantics(template: OfficeTemplate): OfficeTemplate;
//# sourceMappingURL=template-semantics.d.ts.map