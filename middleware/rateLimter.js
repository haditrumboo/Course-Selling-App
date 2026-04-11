 const ratelimit = require('express-rate-limit');

 const limiter = ratelimit ({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false,  message: "Too many requests, try again later"}
 });

 const authLimiter = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "too many login attempts, try again later" }
 });

 module.exports = { limiter, authLimiter };