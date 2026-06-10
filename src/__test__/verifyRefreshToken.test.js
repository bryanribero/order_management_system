import User from '../db/models/User.js'
import sequelize from '../db/database.js'
import { loginUser, registerNewUser } from '../services/auth/auth.service.js'
import { jest } from '@jest/globals'
import { verifyRefreshToken } from '../middlewares/verifyRefreshToken.js'
import jwt from 'jsonwebtoken'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /auth/refresh', () => {
  it('debería validar el refresh token y permitir el acceso al controlador', async () => {
    const dataUser = {
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: '1234567A',
    }

    const { id_user } = await registerNewUser(dataUser)

    const { refreshToken } = await loginUser(dataUser)

    const req = {
      headers: {
        authorization: `bearer ${refreshToken}`,
      },
    }

    const res = {
      status: jest.fn(),
      json: jest.fn(),
    }

    const next = jest.fn()

    verifyRefreshToken(req, res, next)

    expect(req.user).toMatchObject({ id_user })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('debería llamar a next con un error si no existe el header Authorization', () => {
    const req = {
      headers: {},
    }

    const res = {}

    const next = jest.fn()

    verifyRefreshToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token requerido')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })

  it('debería llamar a next con un error si authorization no tiene un formato válido', () => {
    const req = {
      headers: {
        authorization: 'token-random',
      },
    }

    const res = {}

    const next = jest.fn()

    verifyRefreshToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Encabezado Authorization inválido')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })

  it('debería llamar a next con un error si el refresh token es inválido', () => {
    const req = {
      headers: { authorization: `Bearer token-invalido` },
    }

    const res = {}

    const next = jest.fn()

    verifyRefreshToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token inválido')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })

  it('debería llamar a next con un error si el refresh token expiró', () => {
    const payload = {
      id_user: 1,
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      role: 'owner',
    }

    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '-1h',
    })

    const req = {
      headers: { authorization: `Bearer ${token}` },
    }

    const res = {}

    const next = jest.fn()

    verifyRefreshToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))

    const error = next.mock.calls[0][0]

    expect(error.message).toBe('Token expirado')
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeUndefined()
  })
})
