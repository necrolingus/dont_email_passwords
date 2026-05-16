import * as z from 'zod/v4'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
    storeSecret,
    getSecret,
    deleteSecret,
    getConfig,
    getStats
} from './restAdapter.js'

const createServer = () => {
    const server = new McpServer({
        name: 'dont-email-passwords-mcp',
        version: '1.0.0'
    })

    server.registerTool(
        'store_secret',
        {
            description: 'Store a secret using POST /api/secret and return the generated one-time URL.',
            inputSchema: {
                secret: z.string(),
                expire_minutes: z.number().int().positive(),
                expire_clicks: z.number().int().positive()
            }
        },
        async ({ secret, expire_minutes, expire_clicks }) => {
            const data = await storeSecret({ secret, expire_minutes, expire_clicks })

            return {
                content: [
                    {
                        type: 'text',
                        text: typeof data === 'string' ? data : JSON.stringify(data)
                    }
                ]
            }
        }
    )

    server.registerTool(
        'get_secret',
        {
            description: 'Get a secret payload using GET /api/secret/{key}.',
            inputSchema: {
                key: z.string().min(1)
            }
        },
        async ({ key }) => {
            const data = await getSecret({ key })

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            }
        }
    )

    server.registerTool(
        'delete_secret',
        {
            description: 'Delete a secret using DELETE /api/secret/{key}.',
            inputSchema: {
                key: z.string().min(1)
            }
        },
        async ({ key }) => {
            const data = await deleteSecret({ key })

            return {
                content: [
                    {
                        type: 'text',
                        text: typeof data === 'string' ? data : JSON.stringify(data)
                    }
                ]
            }
        }
    )

    server.registerTool(
        'get_config',
        {
            description: 'Read runtime configuration using GET /api/config.'
        },
        async () => {
            const data = await getConfig()
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            }
        }
    )

    server.registerTool(
        'get_stats',
        {
            description: 'Read cache statistics using GET /api/stats.'
        },
        async () => {
            const data = await getStats()
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }
                ]
            }
        }
    )

    return server
}

export { createServer }
