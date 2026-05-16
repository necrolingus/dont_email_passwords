import express from 'express'
import { engine } from 'express-handlebars'
import swaggerUi from 'swagger-ui-express'
import { router } from './routes/routes.js'
import { uiRouter } from './routes/uiRoutes.js'
import { config } from './controller/config.js'
import { globalLimiter } from './middleware/rateLimit.js'
import { headers } from './middleware/headers.js'
import { swaggerSpec } from './swagger/swagger.js'

const port = config.port

//express
const app = express()
app.disable('x-powered-by');
app.set('trust proxy', parseInt(config.rl_number_of_proxies) || 1);
app.use(express.json());
app.use(express.static('public'));
app.use(headers);
app.use(globalLimiter);
app.use('/api', router);
app.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec)
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/ui', uiRouter);

app.listen(port, (err) => {
    console.log(`Listening on port ${port}`)
    if (err) {
        console.log(`Error: ${err}`)
    }
})
