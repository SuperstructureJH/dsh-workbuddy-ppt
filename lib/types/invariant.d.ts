/** Invariant companion reserving ownership for the Office PPT bundle. */
import type { Context } from '@deepseek-ai/cordis';
/** Companion plugin identity. */
export declare const name = "workbuddy-ppt-invariant";
/** Required invariant registry. */
export declare const inject: string[];
/** Reserve package ownership while its composition is active. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map