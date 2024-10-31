import { nanoid } from 'nanoid'
import { validate_store_secret } from '../controller/schema_validator.js'
import { cacheSet, cacheGet, cacheDelete } from '../controller/cacheManager.js'
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

    //check size of body in KB
    const bodySize = (Buffer.byteLength(JSON.stringify(data)))/1024 //get the length of data in KB
    if (bodySize > config.max_body_size) {
        return res.status(413).send(`Request too big. Maximum size ${config.max_body_size}`)
    }

    //store secret
    const key = nanoid() //by default 21 chars, URL safe
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${key}`
    const expire_seconds = data.expire_hours * 60 * 60
    const secret_json = { "secret": data.secret, "expire_clicks": data.expire_clicks, "current_clicks": 0 }
    
    //check cache set outcome
    const outcome = cacheSet(key, secret_json, expire_seconds)

    if (!outcome) {
        return res.status(503).send('Something went wrong, the secret could not be stored')
    }
    return res.status(200).send(fullUrl)
})

router.get('/secret/:key', async function(req, res) {
    const key = req.params.key
    const value = cacheGet(key)

    if(!value) {
        return res.status(404).send("Key not found")
    }
    res.setHeader('Content-Type', 'application/json');
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

export {router}