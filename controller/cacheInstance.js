import nodeCache from 'node-cache'
import { config } from "./config.js";

const localCache = new nodeCache({"stdTTL": 0, "checkperiod": config.check_period_seconds, "deleteOnExpire": true, "maxKeys": config.max_keys })

export {localCache}