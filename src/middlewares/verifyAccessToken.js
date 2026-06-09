import { AuthError } from '../errors/AuthError.js'
import { verifyToken } from '../services/auth/utils/tokens.utils.js'

export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next(new AuthError('Token requerido'))
  }

  const [schema, token] = authHeader.split(' ')

  if (schema.toLowerCase() !== 'bearer') {
    return next(new AuthError('Encabezado Authorization inválido'))
  }

  try {
    const payload = verifyToken(token, 'access')

    req.user = payload

    return next()
  } catch (err) {
    return next(err)
  }
}
