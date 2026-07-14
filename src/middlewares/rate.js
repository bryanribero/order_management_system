import rateLimit from 'express-rate-limit'

const isTest = process.env.NODE_ENV === 'test'

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    errors: [
      {
        message: 'Demasiadas peticiones, intenta nuevamente más tarde.',
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const registerRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: isTest ? 24 : 10,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiados intentos de registro. Intenta nuevamente más tarde.',
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const loginRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: isTest ? 100 : 10,
  message: {
    success: false,
    errors: [
      {
        message: 'Demasiados intentos de login. Intenta nuevamente más tarde.',
      },
    ],
  },
})

export const refreshRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: isTest ? 100 : 5,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiados intentos de Refresh. Intenta nuevamente más tarde.',
      },
    ],
  },
})

export const ProductsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: isTest ? 100 : 20,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiadas peticiones de productos. Intenta nuevamente más tarde.',
      },
    ],
  },
})

export const userRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: isTest ? 100 : 10,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiadas peticiones de usuario. Intenta nuevamente más tarde.',
      },
    ],
  },
})

export const courierRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: isTest ? 100 : 20,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiadas peticiones de courier. Intenta nuevamente más tarde.',
      },
    ],
  },
})

export const customerRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: isTest ? 100 : 20,
  message: {
    success: false,
    errors: [
      {
        message:
          'Demasiadas peticiones de customer. Intenta nuevamente más tarde.',
      },
    ],
  },
})
