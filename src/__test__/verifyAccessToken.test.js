import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'
import { generateTokens } from '../services/auth/utils/tokens.utils.js'
import jwt from 'jsonwebtoken'

describe('verifyAccessToken', () => {
  it('debería permitir el acceso cuando el access token es válido', () => {
    const payload = {
      id_user: 1,
      email: `test-${crypto.randomUUID()}@hotmal.com`,
      role: 'owner',
    }

    const { accessToken } = generateTokens(payload)

    const req = {
      headers: { authorization: `bearer ${accessToken}` },
    }

    const res = {
      status: jest.fn(),
      json: jest.fn(),
    }

    const next = jest.fn()

    verifyAccessToken(req, res, next)

    expect(req.user).toMatchObject(payload)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('debería llamar a next con un error si no existe el header Authorization', () => {
    const req = {
      headers: {},
    }

    const res = {}

    const next = jest.fn()

    verifyAccessToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token requerido')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })

  it('debería llamar a next con un error si el access token es inválido', () => {
    const req = {
      headers: { authorization: `bearer token-invalido` },
    }

    const res = {}

    const next = jest.fn()

    verifyAccessToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token inválido')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })

  it('debería llamar a next con un error si el access token expiró', () => {
    const payload = {
      id_user: 1,
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      role: 'owner',
    }

    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '-1h',
    })

    const req = {
      headers: { authorization: `bearer ${token}` },
    }

    const res = {}

    const next = jest.fn()

    verifyAccessToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token expirado')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })
})
