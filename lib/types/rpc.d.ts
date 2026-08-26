/** Loopback-only Office PPT browser RPC. */
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ConnectionRpcHandler } from '@deepseek-ai/dsh-client-connection';
import { type OfficePptService } from './service.ts';
/** Host-owned lookup for the active session workspace; browser callers never provide filesystem paths. */
export type OfficeWorkspaceRoot = (sessionId: SessionId) => string | undefined;
/**
 * Create the dedicated RPC handler. Only the explicit local reveal endpoint
 * returns a Host-derived directory for a persisted deck; callers never provide
 * or select an output path.
 * @param service - Session-scoped presentation application service.
 * @param workspaceRoot - Host-owned resolver for the active Session workspace.
 * @returns Connection RPC handler for Office PPT endpoints.
 */
export declare function officePptRpc(service: OfficePptService, workspaceRoot: OfficeWorkspaceRoot): ConnectionRpcHandler;
//# sourceMappingURL=rpc.d.ts.map