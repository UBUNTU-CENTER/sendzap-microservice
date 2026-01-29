import axios from 'axios'
import logger from '../config/logger.js'

const WEBHOOK_URL = process.env.WEBHOOK_URL

export const triggerWebhook = async (event, data) => {
    if (!WEBHOOK_URL) {
        return
    }

    try {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        }

        logger.info(`Webhook: Sending ${event} to ${WEBHOOK_URL}`)

        // Simple fire and forget with error logging
        // For production, a queue system (like BullMQ) would be better
        axios.post(WEBHOOK_URL, payload, {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'WhatsApp-Noweb-Microservice'
            }
        }).catch(err => {
            logger.error(`Webhook Error (${event}): ${err.message}`)
        })

    } catch (error) {
        logger.error(`Webhook Dispatch Error:`, error)
    }
}
