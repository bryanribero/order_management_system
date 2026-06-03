export function errorHandler(err, req, res, _next) {
  console.log(err)

  if (err instanceof SyntaxError && err.status == 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      errors: [{ message: 'JSON inválido o mal formado' }],
    })
  }

  const status = err.status || 500

  res.status(status).json({
    success: false,
    errors: [
      {
        message: err.message || 'Error interno del servidor',
      },
    ],
  })
}
