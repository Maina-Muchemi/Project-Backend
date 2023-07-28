const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 50 * 1000, // 50 minute
    max: 4, // Limit each IP to 4 login requests per `window` per minute
    message:
        { message: 'Too many login attempts from this IP, please try again after a 50 second pause' },
    handler: (req, res,options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the headers
    legacyHeaders: false, // Disable the headers
})

module.exports = loginLimiter