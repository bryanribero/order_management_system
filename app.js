import './env.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { globalRateLimit } from './src/middlewares/rate.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import authRoutes from './src/routes/auth.routes.js'
import productsRoutes from './src/routes/products.routes.js'
import usersRoutes from './src/routes/users.routes.js'
import fs from 'fs'
import YAML from 'yaml'
import swaggerUi from 'swagger-ui-express'

const swaggerFile = fs.readFileSync('./docs/swagger.yml', 'utf-8')
const swaggerDocument = YAML.parse(swaggerFile)

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/auth', authRoutes)

app.use('/api/products', productsRoutes)

app.use('/api/users', usersRoutes)

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
