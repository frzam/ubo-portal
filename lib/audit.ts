import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const auditFile = path.join(dataDir, 'audit-log.json');

export type AuditEvent = {
  type: 'login' | 'logout';
  username: string;
  timestamp: string; // ISO string
  ip?: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
};

export async function appendAudit(event: AuditEvent) {
  await fs.mkdir(dataDir, { recursive: true });
  let arr: AuditEvent[] = [];
  try {
    const raw = await fs.readFile(auditFile, 'utf8');
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) arr = [];
  } catch (_) {
    arr = [];
  }
  arr.push(event);
  await fs.writeFile(auditFile, JSON.stringify(arr, null, 2), 'utf8');
}

export async function readAudit(): Promise<AuditEvent[]> {
  try {
    const raw = await fs.readFile(auditFile, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as AuditEvent[]) : [];
  } catch (_) {
    return [];
  }
}

