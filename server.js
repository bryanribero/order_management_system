import app from './app.js'
import { startKeepAlive } from './keepAlive.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`)

  startKeepAlive()
})
