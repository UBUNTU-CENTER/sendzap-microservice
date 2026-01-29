import express from 'express'
import * as sessionController from '../controllers/session.controller.js'
import * as messageController from '../controllers/message.controller.js'

import { messageLimiter, checkNumberLimiter } from '../middleware/rate-limit.middleware.js'

import {
    validateSessionId,
    validateSendMessage,
    validateSendBulk,
    validateCheckNumber,
    validateSendContact,
    validateSetTyping,
    validateListGroupsOrContacts
} from '../middleware/validation.middleware.js'

const router = express.Router()

// Session routes
router.get('/sessions', sessionController.listSessions)
router.post('/session/:id', validateSessionId, sessionController.createOrGetSession)
router.get('/session/:id', validateSessionId, sessionController.getSessionStatus)
router.get('/session/:id/qr', validateSessionId, sessionController.getQRImage)
router.delete('/session/:id', validateSessionId, sessionController.deleteSession)

// Message & Group routes
router.post('/send', validateSendMessage, messageLimiter, messageController.sendMessage)
router.post('/send-bulk', validateSendBulk, messageLimiter, messageController.sendBulkMessage)
router.get('/groups/:sessionId', validateListGroupsOrContacts, messageController.listGroups)
router.get('/contacts/:sessionId', validateListGroupsOrContacts, messageController.listContacts)
router.post('/check-number', validateCheckNumber, checkNumberLimiter, messageController.checkNumber)
router.post('/send-contact', validateSendContact, messageLimiter, messageController.sendContact)
router.post('/set-typing', validateSetTyping, messageController.setTyping)

export default router
