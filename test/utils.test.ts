/**
 * Tests for whozere skill utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatLoginAlert, isQuietHours, generateRecordId } from "../src/utils";
import type { WhozereLoginEvent } from "../src/types";

describe("formatLoginAlert", () => {
  it("should format a basic login event", () => {
    const event: WhozereLoginEvent = {
      event: "login",
      username: "alice",
      hostname: "my-server",
      ip: "192.168.1.100",
      terminal: "ssh",
      timestamp: "2026-02-07T20:45:30+08:00",
      os: "linux",
      message: "test",
    };

    const result = formatLoginAlert(event);

    expect(result).toContain("🔔 Login Alert");
    expect(result).toContain("User: alice");
    expect(result).toContain("Host: my-server");
    expect(result).toContain("OS: linux");
    expect(result).toContain("IP: 192.168.1.100");
    expect(result).toContain("Terminal: ssh");
  });

  it("should handle missing optional fields", () => {
    const event: WhozereLoginEvent = {
      event: "login",
      username: "bob",
      hostname: "server2",
      ip: "",
      terminal: "",
      timestamp: "2026-02-07T10:00:00Z",
      os: "darwin",
      message: "test",
    };

    const result = formatLoginAlert(event);

    expect(result).toContain("User: bob");
    expect(result).not.toContain("IP:");
    expect(result).not.toContain("Terminal:");
  });
});

describe("isQuietHours", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should detect quiet hours during night", () => {
    // Mock current time to 2 AM
    vi.setSystemTime(new Date("2026-02-07T02:00:00"));

    const result = isQuietHours({ start: "23:00", end: "07:00" });

    expect(result).toBe(true);
  });

  it("should return false outside quiet hours", () => {
    // Mock current time to 2 PM
    vi.setSystemTime(new Date("2026-02-07T14:00:00"));

    const result = isQuietHours({ start: "23:00", end: "07:00" });

    expect(result).toBe(false);
  });
});

describe("generateRecordId", () => {
  it("should generate unique IDs", () => {
    const id1 = generateRecordId();
    const id2 = generateRecordId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});
