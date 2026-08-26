/** Static SlideP JSX validation before any model-authored page reaches the renderer. */
/** Stable input error raised when page source is executable JavaScript rather than declarative JSX. */
export declare class StaticJsxError extends Error {
    constructor(message: string);
}
/**
 * Accept one static, single-root SlideP JSX page and reject executable language features.
 * @param fileName - Safe page file name used in diagnostics.
 * @param source - Model-authored JSX source.
 */
export declare function assertStaticSlidepJsx(fileName: string, source: string): void;
//# sourceMappingURL=static-jsx.d.ts.map