import { body } from 'express-validator'

export const credentials = [
  body('email')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage('El email es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('password')
    .exists({ checkFalsy: true })
    .withMessage('La contraseña es obligatoria')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser texto')
    .bail()
    .matches(/^\S+$/)
    .withMessage('La contraseña no puede contener espacios')
    .bail()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .bail()
    .isLength({ max: 16 })
    .withMessage('La contraseña debe de contener hasta 16 caracteres')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula'),
]

export const updateUserValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('password')
    .optional()
    .isString()
    .withMessage('La contraseña debe ser texto')
    .bail()
    .matches(/^\S+$/)
    .withMessage('La contraseña no puede contener espacios')
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage('La contraseña debe tener entre 8 y 16 caracteres')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula'),

  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.password) {
      throw new Error('Debe enviar al menos el email o la contraseña')
    }

    return true
  }),
]

export const passwordValidate = [
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser texto'),
]
