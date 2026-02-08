/**
 * OpenClaw Skill: whozere Login Alert
 *
 * Receives login alerts from whozere and forwards them to configured channels.
 */

export { whozereWebhookHandler } from "./webhooks/whozere.js";
export { whozereHistoryTool, whozereStatsTool } from "./tools/index.js";
export type { WhozereLoginEvent, WhozereConfig } from "./types.js";
