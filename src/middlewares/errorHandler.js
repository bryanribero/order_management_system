export function errorHandler(err, req, res, _next) {
  console.log(err)

  const status = err.status || 500

  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  })
}
