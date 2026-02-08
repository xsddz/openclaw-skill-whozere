/**
 * Utility functions for whozere skill
 */

import type { WhozereLoginEvent } from "./types.js";

/**
 * Format login event as alert message
 */
export function formatLoginAlert(event: WhozereLoginEvent): string {
  // Parse timestamp
  const date = new Date(event.timestamp);
  const zone = Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value || "UTC";

  const offsetMinutes = -date.getTimezoneOffset();
  const offsetHours = Math.floor(offsetMinutes / 60);
  const offsetStr = offsetHours >= 0 ? `UTC+${offsetHours}` : `UTC${offsetHours}`;

  let msg = `🔔 Login Alert\n\n`;
  msg += `User: ${event.username}\n`;
  msg += `Host: ${event.hostname}\n`;
  msg += `Time: ${formatDateTime(date)}\n`;
  msg += `Zone: ${zone} (${offsetStr})\n`;
  msg += `OS: ${event.os}`;

  if (event.ip) {
    msg += `\nIP: ${event.ip}`;
  }
  if (event.terminal) {
    msg += `\nTerminal: ${event.terminal}`;
  }

  return msg;
}

/**
 * Format date/time consistently
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(config: {
  start: string;
  end: string;
  timezone?: string;
}): boolean {
  const now = new Date();

  // Parse time strings (HH:MM format)
  const [startHour, startMin] = config.start.split(":").map(Number);
  const [endHour, endMin] = config.end.split(":").map(Number);

  // Get current time in the configured timezone
  let currentHour: number;
  let currentMin: number;

  if (config.timezone) {
    const timeStr = now.toLocaleTimeString("en-US", {
      timeZone: config.timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    [currentHour, currentMin] = timeStr.split(":").map(Number);
  } else {
    currentHour = now.getHours();
    currentMin = now.getMinutes();
  }

  const currentMins = currentHour * 60 + currentMin;
  const startMins = startHour * 60 + startMin;
  const endMins = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 23:00 - 07:00)
  if (startMins > endMins) {
    return currentMins >= startMins || currentMins < endMins;
  }

  return currentMins >= startMins && currentMins < endMins;
}

/**
 * Generate unique record ID
 */
export function generateRecordId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Parse terminal type for display
 */
export function parseTerminalType(terminal: string): string {
  const lower = terminal.toLowerCase();

  if (lower.includes("ssh") || lower.startsWith("pts/")) {
    return "SSH";
  }
  if (lower.startsWith("tty") || lower === "console") {
    return "Console";
  }
  if (lower.includes("rdp")) {
    return "RDP";
  }
  if (lower.includes("vnc") || lower.includes("screen")) {
    return "VNC/Screen Sharing";
  }

  return terminal;
}
