import { ConflictError } from '../../../errors/ConflictError.js'

const cache = {}

export async function createIdemPotent(
  actionToken,
  userId,
  requestFingerprint,
  action
) {
  if (!actionToken) {
    throw new Error('El token de accion es obligatorio')
  }

  if (cache[actionToken]) {
    const stored = cache[actionToken]

    if (stored.userId !== userId) {
      throw new ConflictError('El actionToken ya fue usado por otro usuario')
    }

    if (stored.requestFingerprint !== requestFingerprint) {
      throw new ConflictError(
        'El actionToken ya fue usado con un contenido diferente'
      )
    }

    return stored.result
  }

  const result = await action()

  cache[actionToken] = {
    userId,
    requestFingerprint,
    result,
  }

  return result
}
