import { nanoid } from 'nanoid'
import { validate_store_secret } from '../controller/schema_validator.js'
import { cacheSet, cacheGet, cacheDelete, cacheStats } from '../controller/cacheManager.js'
import express from 'express'
import { config } from "../controller/config.js";

const router = express.Router()

/**
 * @openapi
 * components:
 *   schemas:
 *     StoreSecretRequest:
 *       type: object
 *       required:
 *         - secret
 *         - expire_minutes
 *         - expire_clicks
 *       properties:
 *         secret:
 *           type: string
 *           description: Secret content to store.
 *           example: MyStrongPassword!123
 *         expire_minutes:
 *           type: integer
 *           minimum: 1
 *           description: Number of minutes before the secret expires.
 *           example: 15
 *         expire_clicks:
 *           type: integer
 *           minimum: 1
 *           description: Number of reads allowed before the secret expires.
 *           example: 3
 *     SecretPayload:
 *       type: object
 *       required:
 *         - secret
 *         - expire_clicks
 *         - current_clicks
 *       properties:
 *         secret:
 *           type: string
 *           example: MyStrongPassword!123
 *         expire_clicks:
 *           type: integer
 *           example: 3
 *         current_clicks:
 *           type: integer
 *           example: 1
 *     ConfigResponse:
 *       type: object
 *       properties:
 *         max_keys:
 *           type: integer
 *           example: 1000
 *         max_key_ttl_minutes:
 *           type: integer
 *           example: 60
 *         max_body_size_kb:
 *           type: integer
 *           example: 10
 *         max_key_expire_clicks:
 *           type: integer
 *           example: 5
 *     StatsResponse:
 *       type: object
 *       properties:
 *         stats:
 *           type: object
 *           description: Node-cache stats object.
 *           additionalProperties: true
 *         Additional:
 *           type: string
 *           example: ksize = Key size in bytes. vsize = Value size in bytes
 *   parameters:
 *     SecretKey:
 *       in: path
 *       name: key
 *       required: true
 *       schema:
 *         type: string
 *       description: Secret key generated when storing a secret.
 */

/**
 * @openapi
 * /api/secret:
 *   post:
 *     tags:
 *       - Secrets
 *     summary: Store a new secret and return the one-time URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreSecretRequest'
 *     responses:
 *       200:
 *         description: Secret stored successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: http://localhost:3000/api/secret/abc123def456
 *       413:
 *         description: Secret is blank or payload is too large.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       422:
 *         description: Validation failed.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       503:
 *         description: Secret could not be stored.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.post('/secret', async function (req, res) {
    const data = req.body
    const valid = validate_store_secret(data)

    //validate the schema
    if (!valid) {
        return res.status(422).send("Schema incorrect.")
    }

    //check that secret is not blank
    if ((data.secret).trim().length === 0 ) {
        return res.status(413).send(`Secret cannot be blank.`)
    }

    //check size of body in KB
    const bodySize = (Buffer.byteLength(JSON.stringify(data)))/1024 //get the length of data in KB
    if (bodySize > config.max_body_size_kb) {
        return res.status(413).send(`Request too big. Check /config endpoint.`)
    }

    //check if passed TTL is greater than the max key ttl
    if ((data.expire_minutes) > config.max_key_ttl_minutes) {
        return res.status(422).send(`Key TTL bigger than set limit. Check /config endpoint.`)
    }

    //check if passed TTL is 0
    if ((data.expire_minutes) == 0) {
        return res.status(422).send(`Key TTL must be greater than 0.`)
    }

    //check if the max clicks for the secret is greater than max_key_clicks
    if (data.expire_clicks > config.max_key_expire_clicks) {
        return res.status(422).send(`Key expire clicks bigger than set limit. Check /config endpoint.`)
    }

    //store secret
    const key = nanoid(12) //by default 21 chars, URL safe
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${key}`
    const expire_seconds = data.expire_minutes * 60
    const secret_json = { "secret": data.secret, "expire_clicks": data.expire_clicks, "current_clicks": 0 }
    
    //check cache set outcome
    const outcome = cacheSet(key, secret_json, expire_seconds)

    if (!outcome) {
        return res.status(503).send('Something went wrong, the secret could not be stored')
    }
    return res.status(200).send(fullUrl)
})

/**
 * @openapi
 * /api/secret/{key}:
 *   get:
 *     tags:
 *       - Secrets
 *     summary: Retrieve a stored secret payload by key.
 *     parameters:
 *       - $ref: '#/components/parameters/SecretKey'
 *     responses:
 *       200:
 *         description: Secret found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecretPayload'
 *       404:
 *         description: Key not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/secret/:key/', async function(req, res) {
    const key = req.params.key
    const value = cacheGet(key)
    
    if(!value) {
        return res.status(404).send("Key not found")
    }
    return res.status(200).json(value)
})

/**
 * @openapi
 * /api/secret/{key}:
 *   delete:
 *     tags:
 *       - Secrets
 *     summary: Delete a stored secret by key.
 *     parameters:
 *       - $ref: '#/components/parameters/SecretKey'
 *     responses:
 *       200:
 *         description: Key deleted.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Key not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.delete('/secret/:key', async function(req, res) {
    const key = req.params.key
    const value = cacheDelete(key)

    if(value === 0) {
        return res.status(404).send("Key not found")
    }
    return res.status(200).send("Key deleted")
})

/**
 * @openapi
 * /api/config:
 *   get:
 *     tags:
 *       - System
 *     summary: Get runtime API limits and configuration values.
 *     responses:
 *       200:
 *         description: Current config values.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfigResponse'
 */
router.get('/config', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
        "max_keys": config.max_keys,
        "max_key_ttl_minutes": config.max_key_ttl_minutes,
        "max_body_size_kb": config.max_body_size_kb,
        "max_key_expire_clicks": config.max_key_expire_clicks
    })
})

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags:
 *       - System
 *     summary: Get in-memory cache stats.
 *     responses:
 *       200:
 *         description: Cache stats.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 */
router.get('/stats', async function (req, res) {
    const stats = cacheStats()
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
        stats,
        "Additional":"ksize = Key size in bytes. vsize = Value size in bytes"
    })
})

export {router}