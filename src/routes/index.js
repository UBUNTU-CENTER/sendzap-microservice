import express from 'express'
import * as sessionController from '../controllers/session.controller.js'
import * as messageController from '../controllers/message.controller.js'

const router = express.Router()

// Session routes
router.get('/sessions', sessionController.listSessions)
router.post('/session/:id', sessionController.createOrGetSession)
router.get('/session/:id', sessionController.getSessionStatus)
router.get('/session/:id/qr', sessionController.getQRImage)
router.delete('/session/:id', sessionController.deleteSession)

// Message & Group routes
router.post('/send', messageController.sendMessage)
router.post('/send-bulk', messageController.sendBulkMessage)
router.get('/groups/:sessionId', messageController.listGroups)
router.get('/contacts/:sessionId', messageController.listContacts)
router.get('/check-number/:sessionId/:number', messageController.checkNumber)
router.post('/send-contact', messageController.sendContact)

export default router
