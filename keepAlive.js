export function startKeepAlive() {
  console.log(`keep-alive iniciado`)
  return setInterval(
    async () => {
      try {
        const response = await fetch(
          'https://order-management-system-995e.onrender.com/api/ping'
        )

        if (!response.ok) {
          console.error(`keep-alive fallo: ${response.status}`)
          return
        }

        console.log(`✅ Petición exitosa: ${response.status}`)
      } catch (err) {
        console.error(`Error en keep-alive: ${err}`)
      }
    },
    5 * 60 * 1000
  )
}
