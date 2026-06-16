import nodeCache from 'node-cache';
import { config } from '../config.js';

export class MemoryStore {
    constructor() {
        this.localCache = null;
    }

    async init() {
        this.localCache = new nodeCache({
            stdTTL: 0,
            checkperiod: config.check_period_seconds,
            deleteOnExpire: true,
            maxKeys: config.max_keys
        });
    }

    async set(key, value, ttlSeconds) {
        return this.localCache.set(key, value, ttlSeconds);
    }

    async get(key) {
        const value = this.localCache.get(key);
        if (!value) return null;

        // update current clicks
        const expire_clicks = value.expire_clicks;
        const current_clicks = value.current_clicks + 1;
        value.current_clicks = current_clicks;

        const remaining_ttl = this.localCache.getTtl(key);
        const remaining_ttl_seconds = (remaining_ttl - Date.now()) / 1000;
        value.remaining_ttl_seconds = Math.round(remaining_ttl_seconds);

        if (current_clicks >= expire_clicks) {
            await this.delete(key);
        } else {
            await this.set(key, value, remaining_ttl_seconds);
        }

        return value;
    }

    async delete(key) {
        return this.localCache.del(key);
    }

    async getStats() {
        return this.localCache.getStats();
    }

    async cleanup() {
        // node-cache handles its own cleanup via checkperiod
    }
}
