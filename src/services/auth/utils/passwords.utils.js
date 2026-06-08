import bcrypt from 'bcrypt'

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
