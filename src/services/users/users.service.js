import User from '../../db/models/User.js'
import { AuthError } from '../../errors/AuthError.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { comparePassword, hashPassword } from '../auth/utils/passwords.utils.js'

export async function updateUser(idUser, setter) {
  if (setter.password) {
    setter.password = await hashPassword(setter.password)
  }

  const [affectedRows, updatedUser] = await User.update(setter, {
    where: {
      id_user: idUser,
    },
    returning: true,
  })

  if (affectedRows === 0) {
    throw new NotFoundError('Usuario no encontrado')
  }

  return updatedUser[0]
}

export async function deleteUser(idUser, password) {
  const user = await User.scope('withPassword').findOne({
    where: {
      id_user: idUser,
    },
  })

  if (!user) {
    throw new NotFoundError('Usuario no encontrado')
  }

  const passwordIsValid = await comparePassword(password, user.password)

  if (!passwordIsValid) {
    throw new AuthError('Contraseña incorrecta')
  }

  await User.destroy({
    where: {
      id_user: idUser,
    },
  })
}
