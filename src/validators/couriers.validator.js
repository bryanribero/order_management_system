import { body, query } from 'express-validator'

export const bodyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El campo name no puede estar vacío')
    .bail()
    .isString()
    .withMessage('El campo name tiene que ser un string')
    .isLength({ max: 50 })
    .withMessage('El campo name no puede contener más de 50 caracteres.'),

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

export const paginationCourierValidator = [
  query('page')
    .optional()
    .isInt()
    .withMessage('La página debe ser un número entero')
    .bail()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor o igual a 1')
    .toInt(),
]
