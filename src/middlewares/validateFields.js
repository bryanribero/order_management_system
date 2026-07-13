import { validationResult } from 'express-validator'

export function validateFields(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path || 'body',
        message: error.msg,
      })),
    })
  }

  next()
}
