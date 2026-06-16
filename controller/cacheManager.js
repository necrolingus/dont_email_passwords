import { config } from './config.js';

let store = null;

async function initStorage() {
    if (store) return;
    
    if (config.storage_type === 'sqlite') {
        const { SqliteStore } = await import('./storage/sqlite.js');
        store = new SqliteStore();
    } else {
        const { MemoryStore } = await import('./storage/memory.js');
        store = new MemoryStore();
    }
    
    await store.init();
}

async function cacheSet(key, value, ttl) {
    if (!store) {
        throw new Error('Storage not initialized. Call initStorage() first.');
    }
    return store.set(key, value, ttl);
}

async function cacheGet(key) {
    if (!store) {
        throw new Error('Storage not initialized. Call initStorage() first.');
    }
    return store.get(key);
}

async function cacheDelete(key) {
    if (!store) {
        throw new Error('Storage not initialized. Call initStorage() first.');
    }
    return store.delete(key);
}

async function cacheStats() {
    if (!store) {
        throw new Error('Storage not initialized. Call initStorage() first.');
    }
    return store.getStats();
}

export { initStorage, cacheSet, cacheGet, cacheDelete, cacheStats };