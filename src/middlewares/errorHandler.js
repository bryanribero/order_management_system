export function errorHandler(err, req, res, _next) {
  console.log(err)

  if (err instanceof SyntaxError && err.status == 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      errors: [{ message: 'JSON inválido o mal formado' }],
    })
  }

  const status = err.status || 500

  const message = status === 500 ? 'Error interno del servidor' : err.message

  res.status(status).json({
    success: false,
    errors: [
      {
        message,
      },
    ],
  })
}
