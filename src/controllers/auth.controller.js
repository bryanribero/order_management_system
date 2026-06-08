import { loginUser, registerNewUser } from '../services/auth/auth.service.js'

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
    const user = await loginUser(req.body)

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    })
  } catch (err) {
    next(err)
  }
}
