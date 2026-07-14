import crypto from 'crypto'
import sequelize from '../db/database.js'
import Courier from '../db/models/Courier.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import {
  createCourier,
  getCouriers,
  getCourierById,
  updateCourierById,
  deleteCourierById,
} from '../services/couriers/couriers.service.js'
import { ConflictError } from '../errors/ConflictError.js'
import { NotFoundError } from '../errors/NotFoundError.js'

async function createUser() {
  return await registerNewUser({
    email: `courier-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

afterEach(async () => {
  await Courier.destroy({
    where: {},
    force: true,
  })

  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Courier Service', () => {
  describe('createCourier', () => {
    it('debería crear un courier para el usuario indicado', async () => {
      const user = await createUser()

      const courier = await createCourier(user.id_user, {
        name: 'Repartidor 1',
        phone: '1234567890',
        note: 'Disponible de lunes a viernes',
      })

      expect(courier).toMatchObject({
        id_courier: expect.any(Number),
        name: 'Repartidor 1',
        phone: '1234567890',
        note: 'Disponible de lunes a viernes',
      })

      const courierDB = await Courier.findByPk(courier.id_courier)
      expect(courierDB).not.toBeNull()
      expect(courierDB.id_user).toBe(user.id_user)
      expect(courierDB.name).toBe('Repartidor 1')
      expect(courierDB.phone).toBe('1234567890')
      expect(courierDB.note).toBe('Disponible de lunes a viernes')
    })

    it('debería permitir el mismo nombre para diferentes usuarios', async () => {
      const firstUser = await createUser()
      const secondUser = await createUser()

      const name = `Repartidor ${crypto.randomUUID()}`

      const firstCourier = await createCourier(firstUser.id_user, {
        name,
        phone: '1234567890',
      })

      const secondCourier = await createCourier(secondUser.id_user, {
        name,
        phone: '0987654321',
      })

      expect(firstCourier.id_user).toBe(firstUser.id_user)
      expect(secondCourier.id_user).toBe(secondUser.id_user)
      expect(firstCourier.name).toBe(name)
      expect(secondCourier.name).toBe(name)
    })

    it('debería rechazar nombres duplicados para el mismo usuario', async () => {
      const user = await createUser()
      const name = 'Repartidor duplicado'

      await createCourier(user.id_user, {
        name,
        phone: '1234567890',
      })

      await expect(
        createCourier(user.id_user, {
          name,
          phone: '0987654321',
        })
      ).rejects.toMatchObject({
        message: 'El name ya esta en uso, debe ser unico por courier',
        status: 409,
      })
    })
  })

  describe('getCouriers', () => {
    it('debería obtener solo los couriers del usuario indicado con paginación', async () => {
      const user = await createUser()
      const otherUser = await createUser()

      const couriers = []
      for (let i = 1; i <= 3; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        couriers.push(
          await createCourier(user.id_user, {
            name: `Repartidor ${i}`,
            phone: `12345678${i}`,
          })
        )
      }

      await createCourier(otherUser.id_user, {
        name: 'Repartidor ajeno',
        phone: '9999999999',
      })

      await Courier.update(
        { deleted_at: new Date() },
        {
          where: {
            id_courier: couriers[0].id_courier,
          },
        }
      )

      const result = await getCouriers(user.id_user, {
        page: 1,
        limit: 10,
      })

      expect(result).toHaveLength(2)
      expect(result.every((courier) => courier.name !== 'Repartidor 1')).toBe(
        true
      )
      expect(result.every((courier) => courier.id_courier !== undefined)).toBe(
        true
      )
    })

    it('debería devolver un arreglo vacío si no hay couriers para el usuario', async () => {
      const user = await createUser()
      await createCourier(await createUser().then((u) => u.id_user), {
        name: 'Repartidor otro',
        phone: '1234567890',
      })

      const result = await getCouriers(user.id_user, { page: 1, limit: 10 })

      expect(result).toEqual([])
    })
  })

  describe('getCourierById', () => {
    it('debería obtener un courier por su identificador para el usuario indicado', async () => {
      const user = await createUser()

      const courier = await createCourier(user.id_user, {
        name: 'Repartidor test',
        phone: '1234567890',
      })

      const result = await getCourierById(user.id_user, courier.id_courier)

      expect(result).toMatchObject({
        id_courier: courier.id_courier,
        name: courier.name,
        phone: courier.phone,
        note: courier.note,
      })
    })

    it('debería lanzar NotFoundError si el courier pertenece a otro usuario', async () => {
      const firstUser = await createUser()
      const secondUser = await createUser()

      const courier = await createCourier(firstUser.id_user, {
        name: 'Repartidor privado',
      })

      await expect(
        getCourierById(secondUser.id_user, courier.id_courier)
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateCourierById', () => {
    it('debería actualizar un courier del usuario indicado', async () => {
      const user = await createUser()

      const courier = await createCourier(user.id_user, {
        name: 'Repartidor original',
        phone: '1234567890',
      })

      const updated = await updateCourierById(
        user.id_user,
        courier.id_courier,
        {
          name: 'Repartidor actualizado',
          phone: '0987654321',
          note: 'Cambio de turno',
        }
      )

      expect(updated).toMatchObject({
        id_courier: courier.id_courier,
        name: 'Repartidor actualizado',
        phone: '0987654321',
        note: 'Cambio de turno',
      })

      const courierDB = await Courier.findByPk(courier.id_courier)
      expect(courierDB.name).toBe('Repartidor actualizado')
      expect(courierDB.phone).toBe('0987654321')
      expect(courierDB.note).toBe('Cambio de turno')
    })

    it('debería lanzar NotFoundError si el courier no existe para el usuario', async () => {
      const user = await createUser()

      await expect(
        updateCourierById(user.id_user, 9999, {
          name: 'Cualquier nombre',
        })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteCourierById', () => {
    it('debería eliminar lógicamente un courier del usuario indicado', async () => {
      const user = await createUser()

      const courier = await createCourier(user.id_user, {
        name: 'Repartidor eliminable',
      })

      await deleteCourierById(user.id_user, courier.id_courier)

      const courierDB = await Courier.findByPk(courier.id_courier)
      expect(courierDB.deleted_at).not.toBeNull()
    })

    it('debería lanzar NotFoundError si el courier no pertenece al usuario', async () => {
      const firstUser = await createUser()
      const secondUser = await createUser()

      const courier = await createCourier(firstUser.id_user, {
        name: 'Repartidor protegido',
      })

      await expect(
        deleteCourierById(secondUser.id_user, courier.id_courier)
      ).rejects.toThrow(NotFoundError)
    })
  })
})
