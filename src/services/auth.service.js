import bcrypt from 'bcrypt'
import User from '../db/models/User.js'
import { UniqueConstraintError } from 'sequelize'
import { ConflictError } from '../errors/ConflictError.js'

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
