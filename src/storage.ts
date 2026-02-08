/**
 * Storage utilities for login records
 */

import type { LoginRecord } from "./types.js";

/**
 * Storage context interface
 */
interface StorageContext {
  store: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    list: <T>(prefix: string) => Promise<T[]>;
  };
  log: (level: "debug" | "info" | "warn" | "error", message: string) => void;
}

/**
 * Storage key prefix
 */
const STORAGE_PREFIX = "whozere:logins";

/**
 * Maximum records to keep per host
 */
const MAX_RECORDS_PER_HOST = 100;

/**
 * Store a login record
 */
export async function storeLoginRecord(
  ctx: StorageContext,
  record: LoginRecord
): Promise<void> {
  const key = `${STORAGE_PREFIX}:${record.hostname}:${record.id}`;
  await ctx.store.set(key, record);
  ctx.log("debug", `Stored login record: ${key}`);

  // Cleanup old records if needed
  await cleanupOldRecords(ctx, record.hostname);
}

/**
 * Get login history for a host
 */
export async function getLoginHistory(
  ctx: StorageContext,
  hostname: string,
  limit = 50
): Promise<LoginRecord[]> {
  const prefix = `${STORAGE_PREFIX}:${hostname}:`;
  const records = await ctx.store.list<LoginRecord>(prefix);

  // Sort by timestamp descending
  return records
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get all login history across all hosts
 */
export async function getAllLoginHistory(
  ctx: StorageContext,
  limit = 100
): Promise<LoginRecord[]> {
  const records = await ctx.store.list<LoginRecord>(`${STORAGE_PREFIX}:`);

  return records
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get login statistics
 */
export async function getLoginStats(
  ctx: StorageContext,
  options: {
    hostname?: string;
    since?: Date;
  } = {}
): Promise<{
  totalLogins: number;
  uniqueUsers: number;
  uniqueIPs: number;
  uniqueHosts: number;
  byUser: Record<string, number>;
  byHost: Record<string, number>;
  byTerminal: Record<string, number>;
  riskBreakdown: Record<string, number>;
}> {
  let prefix = `${STORAGE_PREFIX}:`;
  if (options.hostname) {
    prefix = `${STORAGE_PREFIX}:${options.hostname}:`;
  }

  let records = await ctx.store.list<LoginRecord>(prefix);

  // Filter by date if specified
  if (options.since) {
    const sinceTime = options.since.getTime();
    records = records.filter((r) => new Date(r.timestamp).getTime() >= sinceTime);
  }

  const users = new Set<string>();
  const ips = new Set<string>();
  const hosts = new Set<string>();
  const byUser: Record<string, number> = {};
  const byHost: Record<string, number> = {};
  const byTerminal: Record<string, number> = {};
  const riskBreakdown: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };

  for (const record of records) {
    users.add(record.username);
    hosts.add(record.hostname);
    if (record.ip) ips.add(record.ip);

    byUser[record.username] = (byUser[record.username] || 0) + 1;
    byHost[record.hostname] = (byHost[record.hostname] || 0) + 1;
    if (record.terminal) {
      byTerminal[record.terminal] = (byTerminal[record.terminal] || 0) + 1;
    }
    if (record.riskLevel) {
      riskBreakdown[record.riskLevel] = (riskBreakdown[record.riskLevel] || 0) + 1;
    }
  }

  return {
    totalLogins: records.length,
    uniqueUsers: users.size,
    uniqueIPs: ips.size,
    uniqueHosts: hosts.size,
    byUser,
    byHost,
    byTerminal,
    riskBreakdown,
  };
}

/**
 * Cleanup old records to prevent storage bloat
 */
async function cleanupOldRecords(ctx: StorageContext, hostname: string): Promise<void> {
  const records = await getLoginHistory(ctx, hostname, MAX_RECORDS_PER_HOST + 50);

  if (records.length > MAX_RECORDS_PER_HOST) {
    const toDelete = records.slice(MAX_RECORDS_PER_HOST);
    ctx.log("debug", `Cleaning up ${toDelete.length} old records for ${hostname}`);

    // Note: In a real implementation, we'd have a delete method
    // For now, this is a placeholder for the cleanup logic
  }
}
