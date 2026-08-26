/** Deterministic checker and native compiler for the independent PPT mode. */
import type { OfficePptSceneCheck, OfficePptSceneInput, OfficeTemplate } from './protocol.ts';
/** Host-admitted image bytes consumed by the scene compiler. */
export interface OfficePptSceneAssetBytes {
    readonly id: string;
    readonly fileName: string;
    readonly mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml';
    readonly bytes: Uint8Array;
    readonly sha256: string;
}
/** Native PPTX bytes plus object count from one checked scene. */
export interface CompiledOfficePptScene {
    readonly bytes: Uint8Array;
    readonly nativeObjectCount: number;
}
/**
 * Inspect one normalized scene without writing files or mutating session state.
 * @param input - Strict normalized scene.
 * @param template - Visual system used for page size and font defaults.
 * @param assets - Host-admitted workspace images with content digests.
 * @returns Hash-bound deterministic findings.
 */
export declare function checkOfficePptScene(input: OfficePptSceneInput, template: OfficeTemplate, assets: readonly OfficePptSceneAssetBytes[]): OfficePptSceneCheck;
/**
 * Compile a checked scene into editable native PowerPoint objects.
 * @param input - Normalized scene whose check status is pass or warning.
 * @param template - Visual system used for page size and metadata defaults.
 * @param assets - Host-admitted workspace images.
 * @returns Editable PPTX bytes and native-object count.
 */
export declare function compileOfficePptScene(input: OfficePptSceneInput, template: OfficeTemplate, assets: readonly OfficePptSceneAssetBytes[]): Promise<CompiledOfficePptScene>;
//# sourceMappingURL=ppt-scene.d.ts.map