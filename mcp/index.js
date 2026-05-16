import { randomUUID } from 'node:crypto'
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import { createServer } from './createServer.js'

const host = process.env.MCP_HOST || '0.0.0.0'
const port = Number(process.env.MCP_PORT || 8090)

const app = createMcpExpressApp({ host })
const sessions = {}

app.get('/health', (req, res) => {
    res.status(200).json({
        ok: true,
        service: 'dont-email-passwords-mcp'
    })
})

app.post('/mcp', async (req, res) => {
    const sessionHeader = req.headers['mcp-session-id']
    const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader

    try {
        if (sessionId && sessions[sessionId]) {
            await sessions[sessionId].transport.handleRequest(req, res, req.body)
            return
        }

        if (!sessionId && isInitializeRequest(req.body)) {
            const server = createServer()
            let transport

            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: initializedSessionId => {
                    sessions[initializedSessionId] = { server, transport }
                }
            })

            transport.onclose = async () => {
                const activeSessionId = transport.sessionId
                if (activeSessionId && sessions[activeSessionId]) {
                    await sessions[activeSessionId].server.close()
                    delete sessions[activeSessionId]
                }
            }

            await server.connect(transport)
            await transport.handleRequest(req, res, req.body)
            return
        }

        res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided'
            },
            id: null
        })
    } catch (error) {
        console.error('Error handling MCP POST:', error)
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `MCP server error: ${error.message}`
                },
                id: null
            })
        }
    }
})

app.get('/mcp', async (req, res) => {
    const sessionHeader = req.headers['mcp-session-id']
    const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader

    if (!sessionId || !sessions[sessionId]) {
        res.status(400).send('Invalid or missing session ID')
        return
    }

    try {
        await sessions[sessionId].transport.handleRequest(req, res)
    } catch (error) {
        console.error('Error handling MCP GET:', error)
        if (!res.headersSent) {
            res.status(500).send('Error processing MCP GET request')
        }
    }
})

app.delete('/mcp', async (req, res) => {
    const sessionHeader = req.headers['mcp-session-id']
    const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader

    if (!sessionId || !sessions[sessionId]) {
        res.status(400).send('Invalid or missing session ID')
        return
    }

    try {
        await sessions[sessionId].transport.handleRequest(req, res)
    } catch (error) {
        console.error('Error handling MCP DELETE:', error)
        if (!res.headersSent) {
            res.status(500).send('Error processing MCP DELETE request')
        }
    }
})

app.listen(port, host, error => {
    if (error) {
        console.error('Failed to start MCP server:', error)
        process.exit(1)
    }

    console.log(`MCP server listening on http://${host}:${port}/mcp`)
    console.log(`MCP health endpoint available at http://${host}:${port}/health`)
})

process.on('SIGINT', async () => {
    for (const sessionId of Object.keys(sessions)) {
        await sessions[sessionId].transport.close()
        await sessions[sessionId].server.close()
        delete sessions[sessionId]
    }
    process.exit(0)
})
