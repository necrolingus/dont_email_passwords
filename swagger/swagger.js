import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerJsdoc from 'swagger-jsdoc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Dont Email Passwords API',
            version: '1.0.0',
            description: 'API for creating, reading, deleting secrets and viewing runtime configuration/stats.'
        }
    },
    apis: [
        path.join(projectRoot, 'routes', '*.js')
    ]
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerSpec }
