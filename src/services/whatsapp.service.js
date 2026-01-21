import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import logger from '../config/logger.js'

export async function createConnection(sessionId, { onQR, onStatusChange }) {
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionId}`)
    const { version, isLatest } = await fetchLatestBaileysVersion()

    logger.info(`Session ${sessionId}: Using Baileys v${version.join('.')}, isLatest: ${isLatest}`)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: logger.child({ session: sessionId, level: 'silent' }) // keep baileys internal logs quiet
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr && onQR) {
            onQR(qr)
        }

        if (connection === 'connecting') {
            if (onStatusChange) onStatusChange('connecting')
        }

        if (connection === 'open') {
            logger.info(`Session ${sessionId}: Connected`)
            if (onStatusChange) onStatusChange('connected')
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.code
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            logger.info(`Session ${sessionId}: Connection closed (${statusCode}), reconnecting: ${shouldReconnect}`)

            if (onStatusChange) onStatusChange(shouldReconnect ? 'reconnecting' : 'disconnected')

            if (shouldReconnect) {
                createConnection(sessionId, { onQR, onStatusChange })
            }
        }
    })

    return sock
}
