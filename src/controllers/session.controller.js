import * as sessionManager from '../services/session.manager.js'
import QRCode from 'qrcode'
import logger from '../config/logger.js'

export const listSessions = (req, res) => {
    res.json(sessionManager.getAllSessions())
}

export const createOrGetSession = async (req, res) => {
    try {
        const sessionId = req.params.id
        const session = await sessionManager.createSession(sessionId)

        const response = {
            id: session.id,
            status: session.status,
        }

        if (session.qr) {
            response.qr = await QRCode.toDataURL(session.qr)
        }

        res.json(response)
    } catch (error) {
        logger.error(`Controller Error (createOrGetSession):`, error)
        res.status(500).json({ error: error.message })
    }
}

export const getSessionStatus = async (req, res) => {
    const sessionId = req.params.id
    const session = sessionManager.getSession(sessionId)

    if (!session) {
        return res.status(404).json({ error: 'Session not found' })
    }

    const response = {
        id: session.id,
        status: session.status,
    }

    if (session.qr) {
        response.qr = await QRCode.toDataURL(session.qr)
    }

    res.json(response)
}

export const getQRImage = async (req, res) => {
    const sessionId = req.params.id
    const session = sessionManager.getSession(sessionId)

    if (!session || !session.qr) {
        return res.status(404).send('QR Code not available or session connected')
    }

    res.setHeader('Content-Type', 'image/png')
    await QRCode.toFileStream(res, session.qr)
}

export const deleteSession = async (req, res) => {
    try {
        const sessionId = req.params.id
        await sessionManager.deleteSession(sessionId)
        res.json({ status: 'deleted' })
    } catch (error) {
        logger.error(`Controller Error (deleteSession):`, error)
        res.status(500).json({ error: error.message })
    }
}
