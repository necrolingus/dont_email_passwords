import { nanoid } from 'nanoid'
import { validate_store_secret } from '../controller/schema_validator.js'
import { cacheSet, cacheGet, cacheDelete, cacheStats } from '../controller/cacheManager.js'
import express from 'express'
import { config } from "../controller/config.js";

const router = express.Router()

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

router.get('/secret/:key/', async function(req, res) {
    const key = req.params.key
    const value = cacheGet(key)
    
    if(!value) {
        return res.status(404).send("Key not found")
    }
    return res.status(200).json(value)
})

router.delete('/secret/:key', async function(req, res) {
    const key = req.params.key
    const value = cacheDelete(key)

    if(value === 0) {
        return res.status(404).send("Key not found")
    }
    return res.status(200).send("Key deleted")
})

router.get('/config', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
        "max_keys": config.max_keys,
        "max_key_ttl_minutes": config.max_key_ttl_minutes,
        "max_body_size_kb": config.max_body_size_kb,
        "max_key_expire_clicks": config.max_key_expire_clicks
    })
})

router.get('/stats', async function (req, res) {
    const stats = cacheStats()
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
        stats,
        "Additional":"ksize = Key size in bytes. vsize = Value size in bytes"
    })
})

export {router}