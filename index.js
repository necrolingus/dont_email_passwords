import express from 'express'
import { engine } from 'express-handlebars'
import {router} from './routes/routes.js'
import {uiRouter} from './routes/uiRoutes.js'
import {config} from './controller/config.js'
import { globalLimiter } from './middleware/rateLimit.js'

const port = config.port

//express
const app = express()
app.set('trust proxy', config.rl_number_of_proxies)
app.use(express.json())
app.use(express.static('public'));
app.use(globalLimiter)
app.use('/api', router)

//express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/ui', uiRouter);

app.listen(port, (err) => {
    console.log(`Listening on port ${port}`)
    if(err) {
        console.log(`Error: ${err}`)
    }
})
