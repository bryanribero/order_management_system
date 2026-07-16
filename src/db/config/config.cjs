const env = process.env.NODE_ENV || 'dev'

require('dotenv').config()

require('dotenv').config({ path: `.env.${env}` })

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',

    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
  },

  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',

    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
  },

  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
  },
}
