import axios from 'axios'

const apiBaseUrl = process.env.MCP_API_BASE_URL || 'http://localhost:8080'
const timeoutMs = Number(process.env.MCP_API_TIMEOUT_MS || 8000)

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: timeoutMs,
    headers: process.env.MCP_PUBLIC_DOMAIN ? {
        'X-Forwarded-Host': process.env.MCP_PUBLIC_DOMAIN,
        'X-Forwarded-Proto': 'https'
    } : {}
})

const toErrorMessage = (error, fallbackMessage) => {
    if (error.response) {
        const status = error.response.status
        const body = typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data)
        return `${fallbackMessage} (status ${status}): ${body}`
    }

    if (error.code) {
        return `${fallbackMessage}: ${error.code}`
    }

    return `${fallbackMessage}: ${error.message}`
}

const storeSecret = async ({ secret, expire_minutes, expire_clicks }) => {
    try {
        const response = await apiClient.post('/api/secret', {
            secret,
            expire_minutes,
            expire_clicks
        })
        return response.data
    } catch (error) {
        throw new Error(toErrorMessage(error, 'Failed to store secret'))
    }
}

const getSecret = async ({ key }) => {
    try {
        const response = await apiClient.get(`/api/secret/${encodeURIComponent(key)}`)
        return response.data
    } catch (error) {
        throw new Error(toErrorMessage(error, 'Failed to get secret'))
    }
}

const deleteSecret = async ({ key }) => {
    try {
        const response = await apiClient.delete(`/api/secret/${encodeURIComponent(key)}`)
        return response.data
    } catch (error) {
        throw new Error(toErrorMessage(error, 'Failed to delete secret'))
    }
}

const getConfig = async () => {
    try {
        const response = await apiClient.get('/api/config')
        return response.data
    } catch (error) {
        throw new Error(toErrorMessage(error, 'Failed to get config'))
    }
}

const getStats = async () => {
    try {
        const response = await apiClient.get('/api/stats')
        return response.data
    } catch (error) {
        throw new Error(toErrorMessage(error, 'Failed to get stats'))
    }
}

export {
    storeSecret,
    getSecret,
    deleteSecret,
    getConfig,
    getStats
}
