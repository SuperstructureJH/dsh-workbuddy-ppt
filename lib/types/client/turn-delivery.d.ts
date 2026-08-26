/** Turn-scoped final PPT delivery accumulator. */
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-runtime/client';
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
/** Stable identity and public file name for one successful PPT result. */
export interface OfficePptDelivery {
    readonly deckId: string;
    readonly fileName?: string;
}
interface OfficePptDeliveryFact extends OfficePptDelivery {
    readonly seq: number;
}
/** Successful PPT revisions published against one conversation turn. */
export interface OfficePptDeliveryTurnData {
    readonly deliveries: readonly OfficePptDeliveryFact[];
}
declare module '@deepseek-ai/dsh-client-runtime/client' {
    interface ConversationTurnDataMap {
        /** Successful PPT create/update results accumulated in this Turn. */
        officePptDelivery: OfficePptDeliveryTurnData;
    }
}
interface OfficePptDeliveryState extends OfficePptDeliveryTurnData {
    readonly turn: number;
    readonly calls: ReadonlyMap<string, string>;
}
/**
 * Extract the stable deck identity from the tool's durable result contract.
 * @param text - Durable tool-result text.
 * @returns Stable deck identity, or null when the result does not publish one.
 */
export declare function deckIdFromResultText(text: string): string | null;
/**
 * Extract the final public PPTX name from the durable result summary.
 * @param text - Durable tool-result text.
 * @returns Public PPTX name, or undefined for older result contracts.
 */
export declare function fileNameFromResultText(text: string): string | undefined;
type OfficePptDeliveryStateDefinition = ConversationNodeDefinition<OfficePptDeliveryState>;
/**
 * Resolve the latest successful presentation revision visible to a closing assistant.
 * @param data - Turn-scoped presentation deliveries.
 * @param seq - Closing assistant sequence boundary.
 * @returns Latest visible deck identity, or null when the turn has no delivery.
 */
export declare function deliveryForClosing(data: Readonly<OfficePptDeliveryTurnData> | undefined, seq?: number): OfficePptDelivery | null;
/**
 * Claim the turn tail only when the finished turn produced a PPT revision.
 * @param owner - Candidate turn-tail owner and sequence boundary.
 * @returns Latest visible deck identity, or null when this plugin has no delivery.
 */
export declare function selectOfficePptDelivery(owner: TurnTailOwnerProps): OfficePptDelivery | null;
/** Turn-local successful PPT revision accumulator; it publishes no view node. */
export declare const officePptDeliveryDefinition: OfficePptDeliveryStateDefinition;
export {};
//# sourceMappingURL=turn-delivery.d.ts.map