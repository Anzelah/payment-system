const IOredis = require("ioredis")

// const config = { port: 6379, host: '127.0.0.1' }
const redisConnection = new IOredis()

module.exports = redisConnection;