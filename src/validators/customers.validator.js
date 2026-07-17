import { body } from 'express-validator'

export const bodyCustomerValidate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no puede tener mas de 100 caracteres'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacio')
    .bail()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede tener mas de 255 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('El telefono no es un número de teléfono válido')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El telefono acepta un máximo de 20 caracteres'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La nota acepta un máximo de 500 caracteres'),
]

export const bodyUpdateCustomerValidate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacio')
    .bail()
    .isLength({ max: 100 })
    .withMessage('El nombre no puede tener mas de 100 caracteres'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacio')
    .bail()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede tener mas de 255 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email ingresado no es válido')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('El telefono no es un número de teléfono válido')
    .bail()
    .isLength({ max: 20 })
    .withMessage('El telefono acepta un máximo de 20 caracteres'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La nota acepta un máximo de 500 caracteres'),
]

export const confirmDeleteCustomerValidator = [
  body('confirmDelete')
    .notEmpty()
    .withMessage('El campo confirmDelete es obligatorio')
    .bail()
    .isBoolean()
    .withMessage('El campo confirmDelete tiene que ser un booleano'),
]
