import crypto from 'crypto'

console.log(crypto.randomUUID())

console.log(crypto.randomBytes(16).toString('hex'))
