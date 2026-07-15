import { body } from 'express-validator'

export const bodyCustomerValidate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El campo name no puede estar vacio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El campo name no puede tener mas de 100 caracteres'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('El campo address no puede estar vacio')
    .bail()
    .isLength({ max: 255 })
    .withMessage('El campo address no puede tener mas de 255 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('El campo phone no es un número de teléfono válido')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El campo phone acepta un máximo de 20 caracteres'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El campo note acepta un máximo de 500 caracteres'),
]

export const bodyUpdateCustomerValidate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El campo name no puede estar vacio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El campo name no puede tener mas de 100 caracteres'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El campo address no puede estar vacio')
    .bail()
    .isLength({ max: 255 })
    .withMessage('El campo address no puede tener mas de 255 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('El campo phone no es un número de teléfono válido')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El campo phone acepta un máximo de 20 caracteres'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El campo note acepta un máximo de 500 caracteres'),
]
