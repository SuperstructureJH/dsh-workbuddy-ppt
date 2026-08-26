/** Browser entry: integrate PPT selection into the New Session composer. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Browser services required by the integrated PPT mode. */
export declare const inject: string[];
/** Register the PPT mode below the blank-session composer. */
export declare function apply(ctx: ClientContext): void;
export { OfficePptHeroActions, OfficePptHeroStore, OfficePptInputAccessory } from './OfficePptHero.tsx';
export { OfficePptCreateRow, OfficePptTurnDelivery, OfficePptUpdateRow } from './OfficePptToolRow.tsx';
export { deliveryForClosing } from './turn-delivery.ts';
//# sourceMappingURL=index.d.ts.map