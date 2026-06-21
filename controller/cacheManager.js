import { SqliteStore } from './storage/sqlite.js';

const store = new SqliteStore();

async function initStorage() {
    await store.init();
}

async function cacheSet(key, value, ttl) {
    return store.set(key, value, ttl);
}

async function cacheGet(key) {
    return store.get(key);
}

async function cacheDelete(key) {
    return store.delete(key);
}

async function cacheStats() {
    return store.getStats();
}

export { initStorage, cacheSet, cacheGet, cacheDelete, cacheStats };