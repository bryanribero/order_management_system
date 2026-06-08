import jwt from 'jsonwebtoken'
import RefreshToken from '../../../db/models/RefreshToken.js'
import crypto from 'crypto'
import { AuthError } from '../../../errors/AuthError.js'

export async function revokedOldRefreshToken(idUser, transaction) {
  if (idUser == null || idUser == undefined || !Number.isInteger(idUser)) {
    throw new Error('idUser es inválido')
  }

  await RefreshToken.update(
    {
      revoked_at: new Date(),
    },
    {
      where: {
        id_user: idUser,
        revoked_at: null,
      },
      transaction,
    }
  )
}

export function generateTokens(payload) {
  if (payload?.id_user == null || !payload?.email || !payload?.role) {
    throw new Error('Payload inválido')
  }

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '1h',
  })

  const refreshToken = jwt.sign(
    {
      id_user: payload.id_user,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    }
  )

  return {
    accessToken,
    refreshToken,
  }
}

export function hashRefreshToken(token) {
  if (typeof token != 'string' || !token.trim()) {
    throw new Error('refreshToken inválido')
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex')

  return hashed
}

export async function createRefreshToken(idUser, refreshToken, transaction) {
  if (!Number.isInteger(idUser) || idUser <= 0) {
    throw new Error('El parametro idUser es invalido')
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return await RefreshToken.create(
    {
      id_user: idUser,
      token_hash: refreshToken,
      expires_at: expiresAt,
    },
    {
      transaction,
    }
  )
}

export function verifyToken(token, typeToken) {
  try {
    return typeToken === 'access'
      ? jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      : jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('Token expirado')
    }
    throw new AuthError('Token inválido')
  }
}
