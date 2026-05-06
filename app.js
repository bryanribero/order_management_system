import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { limiterGlobal } from './src/middlewares/rate.js'

const app = express()

app.use(express.json())

app.use(limiterGlobal)

app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(helmet())

app.get('/saludo', (req, res) => {
  res.send('hola')
})

export default app
