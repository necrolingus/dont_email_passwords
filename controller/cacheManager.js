import { localCache } from './cacheInstance.js'

//Set the cache key, its value, and TTL
function cacheSet (key, value, ttl) {
    return localCache.set(key, value, ttl)
}

//get cache key and update the current_clicks by 1
function cacheGet(key) {
    const value = localCache.get(key)
    
    //if the key does not exist, return null
    if (!value) {
        return null
    }

    //update current clicks
    const expire_clicks = value["expire_clicks"]
    const current_clicks = value["current_clicks"] + 1
    value["current_clicks"] = current_clicks
    const remaining_ttl = localCache.getTtl( key )
    const remaining_ttl_ms = (remaining_ttl - Date.now()) / 1000
    value["remaining_ttl_ms"] = remaining_ttl_ms
    
    //if we have more clicks than expire_clicks alllows, delete the key
    if (current_clicks >= expire_clicks) {
        cacheDelete(key)
    } else {
        cacheSet(key, value, remaining_ttl_ms)
    }

    return value
}

//delete the cache key
function cacheDelete(key) {
    const delOutcome = localCache.del(key)
    return delOutcome
}

export {cacheSet, cacheGet, cacheDelete}