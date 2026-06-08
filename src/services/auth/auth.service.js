import bcrypt from 'bcrypt'
import User from '../../db/models/User.js'
import { UniqueConstraintError } from 'sequelize'
import { ConflictError } from '../../errors/ConflictError.js'
import { AuthError } from '../../errors/AuthError.js'
import { hashPassword } from './utils/passwords.utils.js'
import sequelize from '../../db/database.js'
import {
  createRefreshToken,
  generateTokens,
  hashRefreshToken,
  revokedOldRefreshToken,
} from './utils/tokens.utils.js'

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

  const payload = {
    id_user: user.id_user,
    email: user.email,
    role: user.role,
  }

  return sequelize.transaction(async (t) => {
    await revokedOldRefreshToken(user.id_user, t)

    const tokens = generateTokens(payload)

    const hashedRefreshToken = hashRefreshToken(tokens.refreshToken)

    await createRefreshToken(user.id_user, hashedRefreshToken, t)

    return tokens
  })
}
