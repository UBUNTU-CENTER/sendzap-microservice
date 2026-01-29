import rateLimit from 'express-rate-limit'

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    }
})

export const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 message requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Message rate limit exceeded. Please wait a moment.'
    }
})

export const checkNumberLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 number checks per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Number check rate limit exceeded. Please wait a moment.'
    }
})
