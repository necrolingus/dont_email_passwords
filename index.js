import express from 'express'
import {router} from './routes/routes.js'
import {config} from './controller/config.js'
import { globalLimiter } from './middleware/rateLimit.js'

const port = config.port

const app = express()
app.use(express.json())
app.use(globalLimiter)
app.use('/api', router)


app.listen(port, (err) => {
    console.log(`Listening on port ${port}`)

    if(err) {
        console.log(`Error: ${err}`)
    }
})
