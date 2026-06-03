import { registerNewUser } from '../services/auth.service.js'

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
