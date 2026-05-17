import './mcp/index.js'
import express from 'express'
import { engine } from 'express-handlebars'
import swaggerUi from 'swagger-ui-express'
import { router } from './routes/routes.js'
import { uiRouter } from './routes/uiRoutes.js'
import { config } from './controller/config.js'
import { globalLimiter } from './middleware/rateLimit.js'
import { headers } from './middleware/headers.js'
import { swaggerSpec } from './swagger/swagger.js'

// Take Note:
// When you use import './mcp/index.js', Node.js doesn't just read 
// the file—it executes all the code inside it immediately.

// If you look at what mcp/index.js actually does, it creates 
// its own Express app and tells it to listen on port 8090

// Node.js is perfectly happy running multiple HTTP 
// servers on different ports inside a single process.

//Because you've imported the MCP file into the main app file, they 
// are both loaded into the exact same memory space and sharing the same 
// V8 JavaScript engine.


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
