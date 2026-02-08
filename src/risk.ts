/**
 * Risk analysis for login events
 */

import type { WhozereLoginEvent, RiskAnalysis } from "./types.js";

/**
 * Context interface for AI access
 */
interface AIContext {
  ai: (prompt: string) => Promise<string>;
  store: {
    get: <T>(key: string) => Promise<T | null>;
    list: <T>(prefix: string) => Promise<T[]>;
  };
}

/**
 * Analyze login event for potential risks
 */
export async function analyzeRisk(
  ctx: AIContext,
  event: WhozereLoginEvent
): Promise<RiskAnalysis> {
  const factors: string[] = [];
  let baseLevel: "low" | "medium" | "high" | "critical" = "low";

  // Check for root/admin login
  if (event.username === "root" || event.username === "Administrator") {
    factors.push("Privileged user login (root/Administrator)");
    baseLevel = "medium";
  }

  // Check login time
  const loginHour = new Date(event.timestamp).getHours();
  if (loginHour >= 0 && loginHour < 6) {
    factors.push(`Unusual login time (${loginHour}:00 local time)`);
    if (baseLevel === "low") baseLevel = "medium";
  }

  // Check for missing IP (could indicate local or masked login)
  if (!event.ip || event.ip === "" || event.ip === "unknown") {
    factors.push("No source IP recorded");
  }

  // Get historical logins for this user/host
  const historyKey = `logins:${event.hostname}:${event.username}`;
  const history = await ctx.store.list<{ ip: string; timestamp: string }>(historyKey);

  // Check if this is a new IP for this user
  if (event.ip && history.length > 0) {
    const knownIPs = new Set(history.map((h) => h.ip));
    if (!knownIPs.has(event.ip)) {
      factors.push(`New IP address for this user (${event.ip})`);
      if (baseLevel === "low") baseLevel = "medium";
    }
  }

  // If we have risk factors, use AI for deeper analysis
  if (factors.length > 0) {
    try {
      const aiAnalysis = await performAIAnalysis(ctx, event, factors);
      return {
        level: aiAnalysis.level || baseLevel,
        summary: aiAnalysis.summary,
        factors: [...factors, ...aiAnalysis.additionalFactors],
      };
    } catch {
      // Fallback if AI analysis fails
      return {
        level: baseLevel,
        summary: generateBasicSummary(baseLevel, factors),
        factors,
      };
    }
  }

  return {
    level: "low",
    summary: "Normal login activity",
    factors: [],
  };
}

/**
 * Perform AI-powered risk analysis
 */
async function performAIAnalysis(
  ctx: AIContext,
  event: WhozereLoginEvent,
  initialFactors: string[]
): Promise<{
  level: "low" | "medium" | "high" | "critical" | null;
  summary: string;
  additionalFactors: string[];
}> {
  const prompt = `Analyze this login event for security risks:

User: ${event.username}
Host: ${event.hostname}
IP: ${event.ip || "unknown"}
Terminal: ${event.terminal}
Time: ${event.timestamp}
OS: ${event.os}

Initial risk factors detected:
${initialFactors.map((f) => `- ${f}`).join("\n")}

Provide a brief risk assessment in this exact JSON format:
{
  "level": "low" | "medium" | "high" | "critical" | null,
  "summary": "One sentence summary",
  "additionalFactors": ["factor1", "factor2"]
}

Only respond with valid JSON, no other text.`;

  const response = await ctx.ai(prompt);

  try {
    // Parse JSON response
    const parsed = JSON.parse(response.trim());
    return {
      level: parsed.level || null,
      summary: parsed.summary || "Unable to determine risk",
      additionalFactors: parsed.additionalFactors || [],
    };
  } catch {
    return {
      level: null,
      summary: "AI analysis inconclusive",
      additionalFactors: [],
    };
  }
}

/**
 * Generate basic summary without AI
 */
function generateBasicSummary(
  level: "low" | "medium" | "high" | "critical",
  factors: string[]
): string {
  switch (level) {
    case "critical":
      return "Critical security concern detected. Immediate investigation recommended.";
    case "high":
      return "Multiple risk factors detected. Please verify this login.";
    case "medium":
      return `${factors.length} potential concern(s) detected. Review when possible.`;
    case "low":
    default:
      return "Normal login activity.";
  }
}
