import { body } from 'express-validator'

export const creatUserValidation = [
  body('email')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage('El email es obligatorio')
    .bail()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .bail()
    .normalizeEmail(),

  body('password')
    .exists({ checkFalsy: true })
    .withMessage('La contraseña es obligatoria')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser texto')
    .bail()
    .custom((value) => value.trim().length > 0)
    .withMessage('La contraseña no puede contener espacios')
    .bail()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .bail()
    .isLength({ max: 16 })
    .withMessage('La contraseña debe de contener hasta 16 caracteres'),
]
