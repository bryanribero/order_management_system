import { deleteUser, updateUser } from '../services/users/users.service.js'

export async function updateUserController(req, res, next) {
  const setter = req.body
  const idUser = req.user.id_user

  try {
    await updateUser(idUser, setter)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

export async function deleteUserController(req, res, next) {
  const idUser = req.user.id_user
  const password = req.body.password

  try {
    await deleteUser(idUser, password)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
