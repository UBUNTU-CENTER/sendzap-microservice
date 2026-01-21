import * as sessionManager from '../services/session.manager.js'
import logger from '../config/logger.js'

export const sendMessage = async (req, res) => {
    try {
        const { sessionId, to, message, mediaUrl, mediaType, fileName, caption } = req.body
        const session = sessionManager.getSession(sessionId)

        if (!session) {
            return res.status(404).json({ error: 'Session not found' })
        }

        if (session.status !== 'connected') {
            return res.status(400).json({ error: `Session is not connected (current status: ${session.status})` })
        }

        // Heuristic to detect group JID if not provided
        const isGroup = to.includes('-') || to.length > 15
        const jid = to.includes('@') ? to : (isGroup ? `${to}@g.us` : `${to}@s.whatsapp.net`)

        let payload = {}

        if (mediaUrl) {
            const content = { url: mediaUrl }
            switch (mediaType) {
                case 'image':
                    payload = { image: content, caption: caption || message }
                    break
                case 'video':
                    payload = { video: content, caption: caption || message }
                    break
                case 'audio':
                    payload = { audio: content, ptt: false }
                    break
                case 'document':
                    payload = { document: content, fileName: fileName || 'file', caption: caption || message }
                    break
                default:
                    return res.status(400).json({ error: 'Invalid mediaType. Use image, video, audio, or document.' })
            }
        } else {
            payload = { text: message }
        }

        const sentMsg = await session.sock.sendMessage(jid, payload)
        res.json({ status: 'sent', messageId: sentMsg.key.id })
    } catch (error) {
        logger.error(`Controller Error (sendMessage):`, error)
        res.status(500).json({ error: error.message })
    }
}

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const sendBulkMessage = async (req, res) => {
    try {
        const { sessionId, receivers, message, mediaUrl, mediaType, fileName, caption, delayMs = 1000 } = req.body

        if (!receivers || !Array.isArray(receivers) || receivers.length === 0) {
            return res.status(400).json({ error: 'To send bulk messages, provide "receivers" array.' })
        }

        const session = sessionManager.getSession(sessionId)

        if (!session) {
            return res.status(404).json({ error: 'Session not found' })
        }

        if (session.status !== 'connected') {
            return res.status(400).json({ error: `Session is not connected (current status: ${session.status})` })
        }

        const results = []

        // Prepare payload once
        let payload = {}
        if (mediaUrl) {
            const content = { url: mediaUrl }
            switch (mediaType) {
                case 'image':
                    payload = { image: content, caption: caption || message }
                    break
                case 'video':
                    payload = { video: content, caption: caption || message }
                    break
                case 'audio':
                    payload = { audio: content, ptt: false }
                    break
                case 'document':
                    payload = { document: content, fileName: fileName || 'file', caption: caption || message }
                    break
                default:
                    return res.status(400).json({ error: 'Invalid mediaType for bulk send.' })
            }
        } else {
            payload = { text: message }
        }

        // Process sequentially to respect delay and avoid blocking
        // We will respond immediately saying "processing started" or wait? 
        // For robustness, getting a job ID would be better, but for now we wait (up to a limit) or send background.
        // Let's implement synchronous for small batches, but warning: big batches will timeout the HTTP request.
        // Better approach: Start processing and return "bulk_queued" or process limited batch.

        // Let's do it simply: Iterate and send. If list is huge (e.g. > 50), maybe user should handle batching.

        for (const to of receivers) {
            try {
                const isGroup = to.includes('-') || to.length > 15
                const jid = to.includes('@') ? to : (isGroup ? `${to}@g.us` : `${to}@s.whatsapp.net`)

                await session.sock.sendMessage(jid, payload)
                results.push({ to, status: 'sent' })

                if (receivers.indexOf(to) < receivers.length - 1) {
                    await delay(delayMs)
                }
            } catch (err) {
                logger.error(`Failed to send to ${to}:`, err)
                results.push({ to, status: 'failed', error: err.message })
            }
        }

        res.json({ status: 'bulk_completed', results })

    } catch (error) {
        logger.error(`Controller Error (sendBulkMessage):`, error)
        res.status(500).json({ error: error.message })
    }
}

export const listGroups = async (req, res) => {
    try {
        const groups = await sessionManager.getGroups(req.params.sessionId)
        res.json(groups)
    } catch (error) {
        logger.error(`Controller Error (listGroups):`, error)
        res.status(500).json({ error: error.message })
    }
}

export const listContacts = async (req, res) => {
    try {
        const contacts = await sessionManager.getContacts(req.params.sessionId)
        res.json(contacts)
    } catch (error) {
        logger.error(`Controller Error (listContacts):`, error)
        res.status(500).json({ error: error.message })
    }
}
