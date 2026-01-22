import app from './src/app.js'
import { initSessions } from './src/services/session.manager.js'
import logger from './src/config/logger.js'

const PORT = process.env.PORT || 3000

async function bootstrap() {
    try {
        await initSessions()

        const server = app.listen(PORT, () => {
            logger.info(`NOWEB WhatsApp server running on port ${PORT}`)
        })

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use. Please stop the existing process or use a different port.`)
            } else {
                logger.error('Server error:', error)
            }
            process.exit(1)
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

bootstrap()
