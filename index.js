import app from './src/app.js'
import { initSessions } from './src/services/session.manager.js'
import logger from './src/config/logger.js'

const PORT = process.env.PORT || 3000

async function bootstrap() {
    try {
        await initSessions()

        app.listen(PORT, () => {
            logger.info(`NOWEB WhatsApp server running on port ${PORT}`)
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

bootstrap()
