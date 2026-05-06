import rateLimit from 'express-rate-limit'

export const limiterGlobal = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  message: {
    error: 'Demasiadas solicitudes, intenta nuevamente más tarde.',
  },
})
