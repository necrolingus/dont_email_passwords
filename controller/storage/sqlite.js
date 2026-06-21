import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

export class SqliteStore {
    constructor() {
        this.db = null;
        this.cleanupInterval = null;
        this.statements = {};
    }

    async init() {
        const dbPath = config.sqlite_path || './data/secrets.db';
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new DatabaseSync(dbPath);
        
        // Configure SQLite for better concurrency and prevent SQLITE_BUSY errors
        this.db.exec('PRAGMA journal_mode = WAL;');
        this.db.exec('PRAGMA busy_timeout = 5000;');

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS secrets (
                key TEXT PRIMARY KEY,
                secret TEXT NOT NULL,
                expire_clicks INTEGER NOT NULL,
                current_clicks INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `);

        // Prepare SQL statements
        this.statements.insert = this.db.prepare(
            `INSERT OR REPLACE INTO secrets (key, secret, expire_clicks, current_clicks, expires_at)
             VALUES (?, ?, ?, ?, ?)`
        );
        this.statements.select = this.db.prepare(
            'SELECT secret, expire_clicks, current_clicks, expires_at FROM secrets WHERE key = ?'
        );
        this.statements.delete = this.db.prepare('DELETE FROM secrets WHERE key = ?');
        this.statements.updateClicks = this.db.prepare(
            'UPDATE secrets SET current_clicks = ? WHERE key = ?'
        );
        this.statements.count = this.db.prepare('SELECT COUNT(*) as count FROM secrets');
        this.statements.cleanup = this.db.prepare('DELETE FROM secrets WHERE expires_at < ?');

        // Setup periodic cleanup for expired keys
        const checkPeriodMs = (config.check_period_seconds || 500) * 1000;
        this.cleanupInterval = setInterval(() => {
            try {
                this.cleanup();
            } catch (err) {
                console.error('SQLite cleanup error:', err);
            }
        }, checkPeriodMs).unref(); // unref so it doesn't block process exit
    }

    async set(key, value, ttlSeconds) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.statements.insert.run(key, value.secret, value.expire_clicks, value.current_clicks, expiresAt);
        return true;
    }

    async get(key) {
        const now = Date.now();
        const row = this.statements.select.get(key);
        if (!row) return null;

        if (now > row.expires_at) {
            await this.delete(key);
            return null;
        }

        const nextClicks = row.current_clicks + 1;
        const remainingTtlSeconds = Math.round((row.expires_at - now) / 1000);

        if (nextClicks >= row.expire_clicks) {
            await this.delete(key);
        } else {
            this.statements.updateClicks.run(nextClicks, key);
        }

        return {
            secret: row.secret,
            expire_clicks: row.expire_clicks,
            current_clicks: nextClicks,
            remaining_ttl_seconds: remainingTtlSeconds
        };
    }

    async delete(key) {
        const result = this.statements.delete.run(key);
        return result.changes; // returns 1 if deleted, 0 otherwise
    }

    async getStats() {
        const row = this.statements.count.get();
        return {
            keys: row ? row.count : 0,
            hits: 0,
            misses: 0,
            ksize: 0,
            vsize: 0
        };
    }

    async cleanup() {
        const now = Date.now();
        const result = this.statements.cleanup.run(now);
        if (result.changes > 0) {
            console.log(`Cleaned up ${result.changes} expired secrets from SQLite`);
        }
    }

    async close() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
