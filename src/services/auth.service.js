import bcrypt from 'bcrypt'
import User from '../db/models/User.js'
import { UniqueConstraintError, where } from 'sequelize'
import { ConflictError } from '../errors/ConflictError.js'
import { AuthError } from '../errors/AuthError.js'
import jwt from 'jsonwebtoken'
import RefreshToken from '../db/models/RefreshToken.js'

export async function hashPassword(password) {
  const SALT_ROUNDS = 10

  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe ser un string')
  }

  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password, hash) {
  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe ser un string')
  }

  return bcrypt.compare(password, hash)
}

export async function registerNewUser({ email, password }) {
  const passwordHash = await hashPassword(password)

  try {
    const user = await User.create({
      email: email,
      password: passwordHash,
    })

    return {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
    }
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('El email ya está en uso')
    }
    throw err
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.scope('withPassword').findOne({
    where: {
      email: normalizedEmail,
    },
  })

  if (!user) {
    throw new AuthError()
  }

  const passwordIsValid = await bcrypt.compare(password, user.password)

  if (!passwordIsValid) {
    throw new AuthError()
  }

  const payloadAccess = {
    id_user: user.id_user,
    email: user.email,
    role: user.role,
  }

  const payloadRefresh = {
    id_user: user.id_user,
  }

  const accessToken = jwt.sign(payloadAccess, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '1h',
  })

  const refreshToken = jwt.sign(
    payloadRefresh,
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
