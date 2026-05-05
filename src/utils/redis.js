const Redis = require("ioredis")

const redisConnection = new Redis(process.env.REDIS_URL, {
    tls: {}
})

module.exports = redisConnection;