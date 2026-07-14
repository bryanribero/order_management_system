import { body, query } from 'express-validator'

export const createProductValidator = [
  body('name')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage('El nombre del producto es obligatorio')
    .bail()
    .isLength({ max: 50 })
    .withMessage('El nombre del producto debe tener entre 1 y 50 caracteres'),

  body('price')
    .trim()
    .notEmpty()
    .withMessage('El precio del producto es obligatorio')
    .bail()
    .isFloat()
    .withMessage('El precio del producto debe ser decimal')
    .bail()
    .toFloat()
    .isFloat({ gt: 0 })
    .withMessage('El precio del producto debe ser mayor a 0'),

  body('stock')
    .trim()
    .notEmpty()
    .withMessage('El stock del producto es obligatorio')
    .bail()
    .isInt()
    .withMessage('El stock del producto debe ser entero')
    .bail()
    .isInt({ gt: -1 })
    .withMessage('El stock del producto no puede ser negativo'),
]

export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .exists({ checkFalsy: true })
    .withMessage('El nombre del producto es obligatorio')
    .bail()
    .isLength({ max: 50 })
    .withMessage('El nombre del producto debe tener entre 1 y 50 caracteres'),

  body('price')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El precio del producto es obligatorio')
    .bail()
    .isFloat()
    .withMessage('El precio del producto debe ser decimal')
    .bail()
    .toFloat()
    .isFloat({ gt: 0 })
    .withMessage('El precio del producto debe ser mayor a 0'),

  body('stock')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El stock del producto es obligatorio')
    .bail()
    .isInt()
    .withMessage('El stock del producto debe ser entero')
    .bail()
    .isInt({ gt: -1 })
    .withMessage('El stock del producto no puede ser negativo'),
]

export const queryProductValidator = [
  query('word')
    .notEmpty()
    .withMessage(
      'El campo "word" es obligatorio y debe contener un valor para filtrar los productos.'
    ),
]
