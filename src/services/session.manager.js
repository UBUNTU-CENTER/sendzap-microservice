import { createConnection } from './whatsapp.service.js'
import { readdirSync, existsSync } from 'fs'
import logger from '../config/logger.js'

const sessions = new Map()
const SESSIONS_DIR = './sessions'

export async function initSessions() {
    if (!existsSync(SESSIONS_DIR)) return

    const dirs = readdirSync(SESSIONS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name.trim())

    logger.info(`Found ${dirs.length} existing sessions. Reloading...`)

    for (const sessionId of dirs) {
        await createSession(sessionId)
    }
}

export async function createSession(sessionId) {
    if (sessions.has(sessionId)) {
        return sessions.get(sessionId)
    }

    const session = {
        id: sessionId,
        sock: null,
        qr: null,
        status: 'initializing',
    }

    sessions.set(sessionId, session)

    const setupSocket = async () => {
        try {
            await createConnection(sessionId, {
                onQR: (qr) => {
                    session.qr = qr
                    session.status = 'qr'
                },
                onStatusChange: (status) => {
                    session.status = status
                    if (status === 'connected') {
                        session.qr = null
                    }
                },
                onSocket: (sock) => {
                    session.sock = sock
                }
            })
        } catch (error) {
            logger.error(`Error setting up session ${sessionId}:`, error)
            session.status = 'error'
        }
    }

    await setupSocket()
    return session
}

export function getSession(sessionId) {
    return sessions.get(sessionId)
}

export function getAllSessions() {
    return Array.from(sessions.values()).map(s => ({
        id: s.id,
        status: s.status,
        hasQR: !!s.qr
    }))
}

export async function deleteSession(sessionId) {
    const session = sessions.get(sessionId)
    if (session) {
        if (session.sock) {
            try {
                session.sock.ev.removeAllListeners()
                await session.sock.logout()
                session.sock.end(new Error('Session Deleted'))
            } catch (err) {
                logger.error(`Error logging out session ${sessionId}:`, err)
            }
        }
        sessions.delete(sessionId)
        logger.info(`Session ${sessionId}: Deleted and resources pruned.`)
    }
}

export async function getGroups(sessionId) {
    const session = sessions.get(sessionId)
    if (!session || !session.sock) return []
    try {
        const groups = await session.sock.groupFetchAllParticipating()
        return Object.values(groups)
    } catch (error) {
        logger.error(`Error fetching groups for ${sessionId}:`, error)
        return []
    }
}

export async function getContacts(sessionId) {
    const session = sessions.get(sessionId)
    if (!session || !session.sock) return []
    // Placeholder for contacts fetching (requires a Store implementation for full details)
    return []
}
