import express from 'express'
import routes from './routes/index.js'
import logger from './config/logger.js'

const app = express()

app.use(express.json())

// Log requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`)
    next()
})

// Routes
app.use('/', routes)

// Swagger Documentation
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { join } from 'path'

// Load swagger.yaml properly relative to CWD or __dirname
// Since we are using ESM and running from root with 'node index.js', 
// relative path should work if file is in root. I put it in root.
const swaggerDocument = YAML.load('./swagger.yaml')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' })
})

export default app
