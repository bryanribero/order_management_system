import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

const env = process.env.NODE_ENV || 'dev'

dotenv.config()

dotenv.config({
  path: `.env.${env}`,
})

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: console.log,
  }
)

export default sequelize
