/** PPT mode integrated into the blank-session composer. */
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { OfficeTemplate } from '../protocol.ts';
import type { OfficePptClient } from './rpc.ts';
interface HeroState {
    readonly activeMode: 'slides' | 'ppt' | null;
    readonly loading: boolean;
    readonly templates: readonly OfficeTemplate[];
    readonly selectedId: string | null;
    readonly promptPrefix: string;
    readonly error: string;
}
/** Session-keyed presentation state shared by the action tray and composer accessory. */
export declare class OfficePptHeroStore {
    private readonly states;
    private readonly listeners;
    snapshot(sessionId: SessionId): HeroState;
    subscribe(sessionId: SessionId, listener: () => void): () => void;
    setActive(sessionId: SessionId, active: boolean): void;
    setMode(sessionId: SessionId, activeMode: HeroState['activeMode'], promptPrefix?: string): void;
    restoreActive(sessionId: SessionId, activeMode: Exclude<HeroState['activeMode'], null>): void;
    setLoading(sessionId: SessionId, loading: boolean): void;
    setError(sessionId: SessionId, error: string): void;
    setTemplates(sessionId: SessionId, templates: readonly OfficeTemplate[]): void;
    select(sessionId: SessionId, template: OfficeTemplate, promptPrefix: string): void;
    activate(sessionId: SessionId, promptPrefix: string): void;
    deselect(sessionId: SessionId, promptPrefix?: string): void;
    private update;
}
/** Faces supplied by the package registration. */
export interface OfficePptHeroInjected {
    readonly client: OfficePptClient;
    readonly mode: OfficePptHeroStore;
}
/** Compact selected-template thumbnail inside the resident input card. */
export declare function OfficePptInputAccessory({ client, mode, sessionId, t, }: PropsRuntime<'conversation.hero.inputAccessory'> & OfficePptHeroInjected & PropsLocale<'office-ppt'>): import("react").JSX.Element | null;
/** PPT option and in-place template chooser below the New Session composer. */
export declare function OfficePptHeroActions({ client, mode, sessionId, useInput, inputActions, t, }: PropsRuntime<'conversation.hero.actions'> & InjectFace<OfficePptHeroInjected> & PropsLocale<'office-ppt'>): import("react").JSX.Element;
export {};
//# sourceMappingURL=OfficePptHero.d.ts.map