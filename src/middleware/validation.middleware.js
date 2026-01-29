import Joi from 'joi'

// Helper to validate request
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false })
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ')
            return res.status(400).json({ error: errorMessage })
        }
        next()
    }
}

// Common schemas
const sessionIdSchema = Joi.string().alphanum().min(3).max(50).required()
const phoneSchema = Joi.string().min(5).max(20).required()

// Endpoint schemas
export const validateSessionId = validate(Joi.object({
    id: sessionIdSchema
}), 'params')

export const validateSendMessage = validate(Joi.object({
    sessionId: sessionIdSchema,
    to: phoneSchema,
    message: Joi.string().max(4096).optional(),
    mediaUrl: Joi.string().uri().optional(),
    mediaType: Joi.string().valid('image', 'video', 'audio', 'document').optional(),
    fileName: Joi.string().max(255).optional(),
    caption: Joi.string().max(1024).optional()
}))

export const validateSendBulk = validate(Joi.object({
    sessionId: sessionIdSchema,
    receivers: Joi.array().items(phoneSchema).min(1).required(),
    message: Joi.string().max(4096).required(),
    mediaUrl: Joi.string().uri().optional(),
    mediaType: Joi.string().valid('image', 'video', 'audio', 'document').optional(),
    fileName: Joi.string().max(255).optional(),
    caption: Joi.string().max(1024).optional(),
    delayMs: Joi.number().integer().min(100).max(10000).default(1000)
}))

export const validateCheckNumber = validate(Joi.object({
    sessionId: sessionIdSchema,
    number: phoneSchema
}))

export const validateSendContact = validate(Joi.object({
    sessionId: sessionIdSchema,
    to: phoneSchema,
    contactName: Joi.string().max(100).required(),
    contactNumber: phoneSchema,
    organization: Joi.string().max(100).optional()
}))

export const validateSetTyping = validate(Joi.object({
    sessionId: sessionIdSchema,
    to: phoneSchema,
    state: Joi.string().valid('composing', 'recording', 'paused').default('composing')
}))

export const validateListGroupsOrContacts = validate(Joi.object({
    sessionId: sessionIdSchema
}), 'params')
