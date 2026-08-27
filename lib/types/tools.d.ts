/** Model-facing Office PPT tools and explicit write-approval policy. */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type OfficePptState } from './protocol.ts';
import type { OfficePptService } from './service.ts';
/** Stable workflow guidance adapted from the bundled Tencent PPT skill. */
export declare const OFFICE_PPT_SKILL_PROMPT: string;
/** Render authoritative composer state as model-only runtime context. */
export declare function officePptComposerContext(state: OfficePptState): string | undefined;
/** Same-turn proof that the model or user loaded the complete staged Tencent Skill. */
export declare class TencentPptSkillGate {
    private readonly receipts;
    constructor(ctx: Context);
    /**
     * Reject a WorkBuddy render until the complete Skill was loaded inside the active turn.
     * @param agent - Active model agent whose Session log carries the Turn proof.
     */
    assertActivated(agent: Agent | undefined): void;
}
/**
 * Register the bounded presentation tools and their workflow guidance; write calls enter the shared approval waterfall.
 * @param ctx - Cordis context that owns tools and policy hooks.
 * @param service - Office PPT application service.
 */
export declare function registerOfficePptTools(ctx: Context, service: OfficePptService): void;
//# sourceMappingURL=tools.d.ts.map