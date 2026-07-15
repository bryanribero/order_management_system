import { body, query } from 'express-validator'

export const createOrderValidator = [
  body('actionToken')
    .notEmpty()
    .withMessage('El actionToken es obligatorio')
    .bail()
    .isUUID()
    .withMessage('El actionToken debe ser un UUID v4 válido'),

  body('id_customer')
    .exists({ checkFalsy: true })
    .withMessage('El customer es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id del customer debe ser un entero positivo')
    .toInt(),

  body('id_courier')
    .exists({ checkFalsy: true })
    .withMessage('El courier es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id del courier debe ser un entero positivo')
    .toInt(),

  body('note')
    .optional()
    .trim()
    .isString()
    .withMessage('La nota debe ser un texto')
    .bail()
    .isLength({ max: 500 })
    .withMessage('La nota puede contener hasta 500 caracteres'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('El campo items debe ser un array con al menos un ítem'),

  body('items.*.id_product')
    .exists({ checkFalsy: true })
    .withMessage('El id del producto es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id del producto debe ser un número entero positivo'),

  body('items.*.quantity')
    .exists({ checkFalsy: true })
    .withMessage('La cantidad es obligatoria')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('La cantidad debe ser un número entero positivo'),
]

export const statusOrderValidator = [
  query('status')
    .optional()
    .exists({ checkFalsy: true })
    .withMessage('El estado es obligatorio')
    .bail()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('El estado debe ser "pending", "completed" o "cancelled"'),
]

export const updateStatusOrderValidator = [
  body('status')
    .trim()
    .toLowerCase()
    .exists({ checkFalsy: true })
    .withMessage('El estado es obligatorio')
    .bail()
    .isIn(['completed', 'cancelled'])
    .withMessage('El estado debe ser "completed" o "cancelled"'),
]

export const bodyUpdateOrderValidator = [
  body('id_courier')
    .optional()
    .notEmpty()
    .withMessage('El courier no puede estar vacio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id del courier debe ser un entero positivo')
    .toInt(),

  body('note')
    .optional()
    .trim()
    .isString()
    .withMessage('La nota debe ser un texto')
    .bail()
    .isLength({ max: 500 })
    .withMessage('La nota puede contener hasta 500 caracteres'),

  body('items')
    .optional()
    .isObject()
    .withMessage('El campo items debe ser un objeto'),

  body('items.delete')
    .optional()
    .isArray({ min: 1 })
    .withMessage('El campo delete debe ser un array con al menos un elemento'),

  body('items.delete.*')
    .isInt({ gt: 0 })
    .withMessage('Cada elemento de delete debe ser un entero positivo')
    .toInt(),

  body('items.create')
    .optional()
    .isArray({ min: 1 })
    .withMessage('El campo create debe ser un array con al menos un elemento'),

  body('items.create.*.id_product')
    .exists({ checkFalsy: true })
    .withMessage('El id del producto es obligatorio')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('El id del producto debe ser un entero positivo')
    .toInt(),

  body('items.create.*.quantity')
    .exists({ checkFalsy: true })
    .withMessage('La cantidad es obligatoria')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('La cantidad debe ser un entero positivo')
    .toInt(),
]
