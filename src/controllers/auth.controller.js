import {
  loginUser,
  refreshService,
  registerNewUser,
} from '../services/auth/auth.service.js'
import { revokedOldRefreshToken } from '../services/auth/utils/tokens.utils.js'

export async function registerController(req, res, next) {
  try {
    const user = await registerNewUser(req.body)

    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente!',
      user,
    })
  } catch (err) {
    next(err)
  }
}

export async function loginController(req, res, next) {
  try {
    const { accessToken, refreshToken } = await loginUser(req.body)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 1000,
    })

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      accessToken: accessToken,
    })
  } catch (err) {
    next(err)
  }
}

export async function logoutController(req, res, next) {
  try {
    await revokedOldRefreshToken(req.user.id_user)

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente',
    })
  } catch (err) {
    next(err)
  }
}

export async function refreshController(req, res, next) {
  try {
    const { accessToken, refreshToken } = await refreshService(req.user)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 1000,
    })

    res.status(200).json({
      success: true,
      message: 'Tokens renovados correctamente',
      accessToken,
    })
  } catch (err) {
    next(err)
  }
}

export function getStatusRefreshController(req, res) {
  res.status(200).end()
}
