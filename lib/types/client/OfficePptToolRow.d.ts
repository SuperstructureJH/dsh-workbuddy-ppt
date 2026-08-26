/** Compact, replay-stable PPT structure rows inside the conversation. */
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { type OfficePptClient } from './rpc.ts';
import type { OfficePptDelivery } from './turn-delivery.ts';
export interface OfficePptToolRowInjected {
    readonly client: OfficePptClient;
}
type OfficePptToolRowProps = ToolCallViewProps & PropsLocale<'office-ppt'> & InjectFace<OfficePptToolRowInjected>;
export type OfficePptTurnDeliveryProps = Pick<TurnTailOwnerProps, 'openFile'> & PropsLocale<'office-ppt'> & InjectFace<OfficePptToolRowInjected> & {
    readonly matched: OfficePptDelivery;
};
/** Final paged PPT player rendered after the closing assistant message. */
export declare function OfficePptTurnDelivery({ matched, client, openFile, t }: OfficePptTurnDeliveryProps): import("react").JSX.Element;
/** Inline structure browser for a generated presentation. */
export declare function OfficePptCreateRow({ block, inspect, t }: OfficePptToolRowProps): import("react").JSX.Element;
/** Compact focused-edit receipt for one revised page. */
export declare function OfficePptUpdateRow({ block, inspect, t }: OfficePptToolRowProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=OfficePptToolRow.d.ts.map