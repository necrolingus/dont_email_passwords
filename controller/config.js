export const config = {
    port: process.env.DEP_PORT || 3000,
    check_period: process.env.DEP_CACHE_CHECK_PERIOD || 600,
    max_keys: process.env.DEP_CACHE_MAX_KEYS || 10000,
    max_body_size: process.env.DEP_MAX_BODY_SIZE_KB || 10,
    rl_window: process.env.DEP_RL_WINDOW_MINUTES || (5 * 60 * 1000),
    rl_requests_in_window: process.env.DEP_RL_REQUESTS_IN_WINDOW || 40
};