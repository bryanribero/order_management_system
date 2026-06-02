import bcrypt from 'bcrypt'

export async function hashPassword(password) {
  const SALT_ROUNDS = 10

  const hash = await bcrypt.hash(String(password), SALT_ROUNDS)

  return hash
}

export async function comparePassword(password, hash) {
  const isValidPassword = await bcrypt.compare(String(password), hash)

  return isValidPassword
}
