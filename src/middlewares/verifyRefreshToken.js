import RefreshToken from '../db/models/RefreshToken.js'
import { AuthError } from '../errors/AuthError.js'
import {
  hashRefreshToken,
  verifyToken,
} from '../services/auth/utils/tokens.utils.js'

export async function verifyRefreshToken(req, res, next) {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return next(new AuthError('Refresh token requerido'))
    }
    const payload = verifyToken(token, 'refresh')

    const resfreshTokenDB = await RefreshToken.findOne({
      where: { id_user: payload.id_user, revoked_at: null },
    })

    if (!resfreshTokenDB) {
      return next(new AuthError('Token revocado'))
    }

    const hashedRefreshToken = hashRefreshToken(token)

    if (hashedRefreshToken !== resfreshTokenDB.token_hash) {
      return next(new AuthError('Token revocado'))
    }

    req.user = payload

    return next()
  } catch (err) {
    return next(err)
  }
}
