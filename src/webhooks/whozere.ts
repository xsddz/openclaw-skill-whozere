/**
 * Webhook handler for whozere login events
 */

import type { WhozereLoginEvent, WhozereConfig, LoginRecord } from "../types.js";
import { formatLoginAlert, isQuietHours, generateRecordId } from "../utils.js";
import { analyzeRisk } from "../risk.js";
import { storeLoginRecord } from "../storage.js";

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<WhozereConfig> = {
  enabled: true,
  announce: true,
  channel: "main",
  riskAnalysis: false,
  quietHours: null,
};

/**
 * Webhook handler context (provided by OpenClaw)
 */
interface WebhookContext {
  /** Send message to current session */
  send: (message: string) => Promise<void>;
  /** Announce message to specified channel */
  announce: (message: string, options?: { channel?: string; session?: string }) => Promise<void>;
  /** Get skill configuration */
  config: <T>(key: string, defaultValue?: T) => T;
  /** Log message */
  log: (level: "debug" | "info" | "warn" | "error", message: string) => void;
  /** Request AI completion */
  ai: (prompt: string) => Promise<string>;
  /** Store data */
  store: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    list: <T>(prefix: string) => Promise<T[]>;
  };
}

/**
 * Validate incoming payload
 */
function validatePayload(payload: unknown): payload is WhozereLoginEvent {
  if (!payload || typeof payload !== "object") return false;

  const p = payload as Record<string, unknown>;

  return (
    p.event === "login" &&
    typeof p.username === "string" &&
    typeof p.hostname === "string" &&
    typeof p.timestamp === "string"
  );
}

/**
 * Main webhook handler for whozere events
 */
export async function whozereWebhookHandler(
  ctx: WebhookContext,
  payload: unknown
): Promise<{ success: boolean; message?: string }> {
  // Get configuration
  const config: Required<WhozereConfig> = {
    ...DEFAULT_CONFIG,
    enabled: ctx.config("whozere.enabled", DEFAULT_CONFIG.enabled),
    announce: ctx.config("whozere.announce", DEFAULT_CONFIG.announce),
    channel: ctx.config("whozere.channel", DEFAULT_CONFIG.channel),
    riskAnalysis: ctx.config("whozere.riskAnalysis", DEFAULT_CONFIG.riskAnalysis),
    quietHours: ctx.config("whozere.quietHours", DEFAULT_CONFIG.quietHours),
  };

  // Check if skill is enabled
  if (!config.enabled) {
    ctx.log("debug", "whozere skill is disabled, ignoring event");
    return { success: true, message: "Skill disabled" };
  }

  // Validate payload
  if (!validatePayload(payload)) {
    ctx.log("warn", "Invalid whozere payload received");
    return { success: false, message: "Invalid payload" };
  }

  ctx.log("info", `Login event received: ${payload.username}@${payload.hostname}`);

  // Create login record
  const record: LoginRecord = {
    ...payload,
    id: generateRecordId(),
    receivedAt: new Date().toISOString(),
  };

  // Perform risk analysis if enabled
  let riskMessage = "";
  if (config.riskAnalysis) {
    try {
      const risk = await analyzeRisk(ctx, payload);
      record.riskLevel = risk.level;
      record.riskSummary = risk.summary;

      if (risk.level !== "low") {
        riskMessage = `\n\n⚠️ Risk Analysis: ${risk.level.toUpperCase()}\n${risk.factors.map((f: string) => `- ${f}`).join("\n")}\n\n${risk.summary}`;
      }
    } catch (err) {
      ctx.log("error", `Risk analysis failed: ${err}`);
    }
  }

  // Store login record
  await storeLoginRecord(ctx, record);

  // Check quiet hours
  if (config.quietHours && isQuietHours(config.quietHours)) {
    // Only alert for high/critical risk during quiet hours
    if (!record.riskLevel || record.riskLevel === "low" || record.riskLevel === "medium") {
      ctx.log("info", "Quiet hours active, suppressing non-critical alert");
      return { success: true, message: "Quiet hours - alert suppressed" };
    }
  }

  // Format alert message
  const alertMessage = formatLoginAlert(payload) + riskMessage;

  // Send notification
  if (config.announce) {
    await ctx.announce(alertMessage, {
      channel: config.channel === "main" ? undefined : config.channel,
      session: config.channel === "main" ? "main" : undefined,
    });
  } else {
    await ctx.send(alertMessage);
  }

  ctx.log("info", `Alert sent to ${config.channel}`);

  return { success: true, message: "Alert sent" };
}
