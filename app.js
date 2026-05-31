import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { limiterGlobal } from './src/middlewares/rate.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import usersRouter from './src/rutes/users.routes.js'

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

app.use('/api/users', usersRouter)

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  })
})

app.use(errorHandler)

export default app
