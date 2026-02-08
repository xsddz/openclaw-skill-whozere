/**
 * Type definitions for whozere skill
 */

/**
 * Login event payload from whozere
 */
export interface WhozereLoginEvent {
  /** Event type, always "login" */
  event: "login";
  /** Username who logged in */
  username: string;
  /** Hostname of the machine */
  hostname: string;
  /** Source IP address */
  ip: string;
  /** Terminal/session type (ssh, tty, pts, console, rdp, vnc) */
  terminal: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Operating system (linux, darwin, windows) */
  os: string;
  /** Formatted message from whozere */
  message: string;
}

/**
 * Skill configuration options
 */
export interface WhozereConfig {
  /** Enable/disable the skill */
  enabled?: boolean;
  /** Proactively send alerts */
  announce?: boolean;
  /** Target channel for alerts */
  channel?: "main" | "telegram" | "slack" | "discord" | "whatsapp" | "signal";
  /** Enable AI risk analysis */
  riskAnalysis?: boolean;
  /** Quiet hours configuration */
  quietHours?: {
    start: string;
    end: string;
    timezone?: string;
  } | null;
}

/**
 * Stored login record for history
 */
export interface LoginRecord extends WhozereLoginEvent {
  /** Internal record ID */
  id: string;
  /** When the record was received by OpenClaw */
  receivedAt: string;
  /** Risk level if analysis was performed */
  riskLevel?: "low" | "medium" | "high" | "critical";
  /** Risk analysis summary */
  riskSummary?: string;
}

/**
 * Risk analysis result
 */
export interface RiskAnalysis {
  level: "low" | "medium" | "high" | "critical";
  summary: string;
  factors: string[];
}
