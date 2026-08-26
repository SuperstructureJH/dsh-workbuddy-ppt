/** Kimi PPTD-compatible source serialization for the local DSH renderer. */
import type { OfficePptSceneInput, OfficeTemplate } from './protocol.ts';
import type { OfficePptSceneAssetBytes } from './ppt-scene.ts';
import type { PptdProjectSource } from './pptd.ts';
/** Text files that form one editable Kimi PPTD-compatible project. */
export interface KimiPptdProject {
    readonly manifest: string;
    readonly pages: readonly {
        readonly fileName: string;
        readonly content: string;
    }[];
}
/**
 * Serialize one checked DSH scene to the documented Kimi PPTD v2 project shape.
 * @param input - Strict checked scene.
 * @param template - Visual-system defaults used for theme and fonts.
 * @param assets - Host-admitted image bytes already copied into the published project.
 */
export declare function serializeKimiPptdProject(input: OfficePptSceneInput, template: OfficeTemplate, assets: readonly OfficePptSceneAssetBytes[]): KimiPptdProject;
/** Build the shared PPTD engine input from one serialized scene project and its admitted images. */
export declare function kimiPptdProjectSource(project: KimiPptdProject, assets: readonly OfficePptSceneAssetBytes[]): PptdProjectSource;
//# sourceMappingURL=kimi-pptd.d.ts.map