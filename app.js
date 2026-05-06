import express from 'express'

const app = express()

app.use(express.json())

app.get('/saludo', (req, res) => {
  res.send('hola')
})

export default app
