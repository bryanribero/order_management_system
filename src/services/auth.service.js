import bcrypt from 'bcrypt'
import User from '../db/models/User.js'
import { UniqueConstraintError } from 'sequelize'

export async function hashPassword(password) {
  const SALT_ROUNDS = 10

  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe de ser un string')
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS)

  return hash
}

export async function comparePassword(password, hash) {
  if (typeof password !== 'string') {
    throw new TypeError('La contraseña debe de ser un string')
  }

  const isValidPassword = await bcrypt.compare(password, hash)

  return isValidPassword
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
      const conflictError = new Error('El email ya está en uso')
      conflictError.status = 409

      throw conflictError
    }
    throw err
  }
}
