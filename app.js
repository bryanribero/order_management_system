import './env.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { globalRateLimit } from './src/middlewares/rate.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import authRoutes from './src/rutes/auth.routes.js'

const app = express()

app.use(express.json())

app.use(globalRateLimit)

app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(helmet())

app.use('/api/auth', authRoutes)

app.use((req, res) => {
  res.status(404).json({
    errors: [
      {
        message: 'Ruta no encontrada',
      },
    ],
  })
})

app.use(errorHandler)

export default app
