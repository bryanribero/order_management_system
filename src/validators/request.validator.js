import { param, query } from 'express-validator'

export const paginationValidator = [
  query('page')
    .optional()
    .isInt()
    .withMessage('La página debe ser un número entero')
    .bail()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor o igual a 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt()
    .withMessage('El límite debe ser un número entero')
    .bail()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe estar entre 1 y 50')
    .toInt(),
]

export const paramsValidator = [
  param('id')
    .isInt()
    .withMessage('El identificador debe ser un número entero')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El identificador debe ser mayor o igual a 1')
    .toInt(),
]
