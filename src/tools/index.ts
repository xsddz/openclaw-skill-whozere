/**
 * OpenClaw tools for whozere skill
 */

import { getLoginHistory, getAllLoginHistory, getLoginStats } from "../storage.js";
import { formatLoginAlert } from "../utils.js";
import type { LoginRecord } from "../types.js";

/**
 * Tool context interface
 */
interface ToolContext {
  store: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    list: <T>(prefix: string) => Promise<T[]>;
  };
  log: (level: "debug" | "info" | "warn" | "error", message: string) => void;
}

/**
 * Tool definition for whozere.history
 */
export const whozereHistoryTool = {
  name: "whozere.history",
  description: "Query recent login history from whozere alerts",
  parameters: {
    type: "object" as const,
    properties: {
      hostname: {
        type: "string" as const,
        description: "Filter by specific hostname (optional)",
      },
      username: {
        type: "string" as const,
        description: "Filter by specific username (optional)",
      },
      limit: {
        type: "number" as const,
        description: "Maximum number of records to return (default: 10)",
      },
    },
  },

  async execute(
    ctx: ToolContext,
    params: {
      hostname?: string;
      username?: string;
      limit?: number;
    }
  ): Promise<string> {
    const limit = params.limit || 10;

    let records: LoginRecord[];

    if (params.hostname) {
      records = await getLoginHistory(ctx, params.hostname, limit * 2);
    } else {
      records = await getAllLoginHistory(ctx, limit * 2);
    }

    // Filter by username if specified
    if (params.username) {
      records = records.filter((r) => r.username === params.username);
    }

    // Apply limit
    records = records.slice(0, limit);

    if (records.length === 0) {
      return "No login records found.";
    }

    // Format output
    let output = `Found ${records.length} login record(s):\n\n`;

    for (const record of records) {
      output += `---\n`;
      output += formatLoginAlert(record);
      if (record.riskLevel && record.riskLevel !== "low") {
        output += `\nRisk: ${record.riskLevel.toUpperCase()}`;
      }
      output += `\n\n`;
    }

    return output;
  },
};

/**
 * Tool definition for whozere.stats
 */
export const whozereStatsTool = {
  name: "whozere.stats",
  description: "Get login statistics from whozere alerts",
  parameters: {
    type: "object" as const,
    properties: {
      hostname: {
        type: "string" as const,
        description: "Filter by specific hostname (optional)",
      },
      period: {
        type: "string" as const,
        enum: ["1h", "24h", "7d", "30d", "all"] as const,
        description: "Time period for statistics (default: 7d)",
      },
    },
  },

  async execute(
    ctx: ToolContext,
    params: {
      hostname?: string;
      period?: string;
    }
  ): Promise<string> {
    // Calculate since date
    let since: Date | undefined;
    const period = params.period || "7d";

    if (period !== "all") {
      const now = Date.now();
      const periodMs: Record<string, number> = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      since = new Date(now - (periodMs[period] || periodMs["7d"]));
    }

    const stats = await getLoginStats(ctx, {
      hostname: params.hostname,
      since,
    });

    // Format output
    let output = `📊 Login Statistics`;
    if (params.hostname) {
      output += ` for ${params.hostname}`;
    }
    output += ` (${period})\n\n`;

    output += `Total logins: ${stats.totalLogins}\n`;
    output += `Unique users: ${stats.uniqueUsers}\n`;
    output += `Unique IPs: ${stats.uniqueIPs}\n`;
    output += `Unique hosts: ${stats.uniqueHosts}\n\n`;

    // Top users
    const topUsers = Object.entries(stats.byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topUsers.length > 0) {
      output += `Top users:\n`;
      for (const [user, count] of topUsers) {
        output += `  - ${user}: ${count} login(s)\n`;
      }
      output += `\n`;
    }

    // Terminal breakdown
    const terminals = Object.entries(stats.byTerminal)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (terminals.length > 0) {
      output += `By terminal type:\n`;
      for (const [terminal, count] of terminals) {
        output += `  - ${terminal}: ${count}\n`;
      }
      output += `\n`;
    }

    // Risk breakdown
    const hasRisk = Object.values(stats.riskBreakdown).some((v) => v > 0);
    if (hasRisk) {
      output += `Risk breakdown:\n`;
      output += `  - Low: ${stats.riskBreakdown.low || 0}\n`;
      output += `  - Medium: ${stats.riskBreakdown.medium || 0}\n`;
      output += `  - High: ${stats.riskBreakdown.high || 0}\n`;
      output += `  - Critical: ${stats.riskBreakdown.critical || 0}\n`;
    }

    return output;
  },
};
