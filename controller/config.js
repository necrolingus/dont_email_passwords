export const config = {
    port: process.env.DEP_PORT || 3000,
    check_period_seconds: process.env.DEP_CACHE_CHECK_PERIOD_SECONDS || 500,
    max_keys: process.env.DEP_CACHE_MAX_KEYS || 5000,
    max_key_ttl_minutes: process.env.DEP_CACHE_MAX_KEY_TTL_MINUTES || 10080, //7 days
    max_key_expire_clicks: process.env.DEP_CACHE_MAX_KEY_EXPIRE_CLICKS || 1000,
    max_body_size_kb: process.env.DEP_CACHE_MAX_BODY_SIZE_KB || 10,
    rl_window_minutes: process.env.DEP_RL_WINDOW_MINUTES || 5,
    rl_requests_in_window: process.env.DEP_RL_REQUESTS_IN_WINDOW || 40
};