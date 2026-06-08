import {
  generateTokens,
  verifyToken,
} from '../services/auth/utils/tokens.utils.js'

describe('verifyToken', () => {
  it('debería verificar el token y devolver el payload decodificado', () => {
    const payload = {
      id_user: 1,
      email: 'pepito@hotmail.com',
      role: 'owner',
    }

    const { accessToken, _refreshToken } = generateTokens(payload)

    const verify = verifyToken(accessToken, 'access')

    expect(verify).toMatchObject(payload)
  })

  it('debería lanzar un error si el token es inválido', () => {
    expect(() => verifyToken('token-invalido')).toThrow()
  })

  it('debería lanzar un error si el token es undefined', () => {
    expect(() => verifyToken()).toThrow()
  })

  it('debería lanzar un error si el token está vacío', () => {
    expect(() => verifyToken('')).toThrow()
  })
})
