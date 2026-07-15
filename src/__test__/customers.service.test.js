import crypto from 'crypto'
import sequelize from '../db/database.js'
import Customer from '../db/models/Customer.js'
import User from '../db/models/User.js'
import { registerNewUser } from '../services/auth/auth.service.js'
import {
  createCustomer,
  deleteAllCustomers,
  deleteCustomerById,
  getCustomerById,
  getCustomers,
  updateCustomerById,
} from '../services/customers/customers.service.js'
import { AuthError } from '../errors/AuthError.js'
import { NotFoundError } from '../errors/NotFoundError.js'

async function createUser() {
  return await registerNewUser({
    email: `customer-service-${crypto.randomUUID()}@hotmail.com`,
    password: '1234567A',
  })
}

afterEach(async () => {
  await Customer.destroy({ where: {}, force: true })
  await User.destroy({ where: {}, force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Customer Service', () => {
  describe('createCustomer', () => {
    it('debería crear un customer para el usuario indicado', async () => {
      const user = await createUser()

      const customer = await createCustomer(user.id_user, {
        name: 'María López',
        address: 'Av. Siempre Viva 123',
        email: 'maria@example.com',
        phone: '1122334455',
        note: 'Cliente frecuente',
      })

      expect(customer).toMatchObject({
        id_customer: expect.any(Number),
        id_user: user.id_user,
        name: 'María López',
        address: 'Av. Siempre Viva 123',
        email: 'maria@example.com',
        phone: '1122334455',
        note: 'Cliente frecuente',
      })

      const customerDB = await Customer.findByPk(customer.id_customer)
      expect(customerDB).not.toBeNull()
      expect(customerDB.id_user).toBe(user.id_user)
    })
  })

  describe('getCustomers', () => {
    it('debería devolver solo los customers activos del usuario indicado', async () => {
      const user = await createUser()
      const otherUser = await createUser()

      const firstCustomer = await createCustomer(user.id_user, {
        name: 'Cliente 1',
        address: 'Calle 1',
      })

      const secondCustomer = await createCustomer(user.id_user, {
        name: 'Cliente 2',
        address: 'Calle 2',
      })

      await createCustomer(otherUser.id_user, {
        name: 'Cliente ajeno',
        address: 'Calle ajena',
      })

      await Customer.update(
        { deleted_at: new Date() },
        { where: { id_customer: firstCustomer.id_customer } }
      )

      const result = await getCustomers(user.id_user, { page: 1, limit: 10 })

      expect(result).toHaveLength(1)
      expect(result[0].id_customer).toBe(secondCustomer.id_customer)
      expect(result[0].name).toBe('Cliente 2')
    })
  })

  describe('getCustomerById', () => {
    it('debería obtener un customer por su identificador', async () => {
      const user = await createUser()
      const customer = await createCustomer(user.id_user, {
        name: 'Cliente detalle',
        address: 'Calle detalle',
      })

      const result = await getCustomerById(user.id_user, customer.id_customer)

      expect(result).toMatchObject({
        id_customer: customer.id_customer,
        name: 'Cliente detalle',
        address: 'Calle detalle',
      })
    })

    it('debería lanzar NotFoundError si el customer pertenece a otro usuario', async () => {
      const firstUser = await createUser()
      const secondUser = await createUser()

      const customer = await createCustomer(firstUser.id_user, {
        name: 'Cliente privado',
        address: 'Direccion privada',
      })

      await expect(
        getCustomerById(secondUser.id_user, customer.id_customer)
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateCustomerById', () => {
    it('debería actualizar un customer del usuario indicado', async () => {
      const user = await createUser()
      const customer = await createCustomer(user.id_user, {
        name: 'Cliente original',
        address: 'Calle original',
      })

      const updated = await updateCustomerById(user.id_user, customer.id_customer, {
        name: 'Cliente actualizado',
        address: 'Calle actualizada',
        phone: '5551234',
        note: 'Cambio de dirección',
      })

      expect(updated).toMatchObject({
        id_customer: customer.id_customer,
        name: 'Cliente actualizado',
        address: 'Calle actualizada',
        phone: '5551234',
        note: 'Cambio de dirección',
      })
    })

    it('debería lanzar NotFoundError si el customer no existe para el usuario', async () => {
      const user = await createUser()

      await expect(
        updateCustomerById(user.id_user, 9999, { name: 'Cualquier nombre' })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteAllCustomers', () => {
    it('debería eliminar lógicamente todos los customers del usuario indicado', async () => {
      const user = await createUser()

      await createCustomer(user.id_user, {
        name: 'Cliente 1',
        address: 'Calle 1',
      })
      await createCustomer(user.id_user, {
        name: 'Cliente 2',
        address: 'Calle 2',
      })

      const deletedCount = await deleteAllCustomers(user.id_user, {
        confirmDelete: true,
      })

      expect(deletedCount).toBe(2)

      const remainingCustomers = await Customer.findAll({
        where: { id_user: user.id_user },
      })

      expect(remainingCustomers.every((customer) => customer.deleted_at)).toBe(true)
    })

    it('debería rechazar la operación si confirmDelete es falso', async () => {
      const user = await createUser()

      await expect(
        deleteAllCustomers(user.id_user, { confirmDelete: false })
      ).rejects.toThrow(AuthError)
    })
  })

  describe('deleteCustomerById', () => {
    it('debería eliminar lógicamente un customer del usuario indicado', async () => {
      const user = await createUser()
      const customer = await createCustomer(user.id_user, {
        name: 'Cliente eliminable',
        address: 'Calle eliminable',
      })

      await deleteCustomerById(user.id_user, customer.id_customer)

      const customerDB = await Customer.findByPk(customer.id_customer)
      expect(customerDB.deleted_at).not.toBeNull()
    })

    it('debería lanzar NotFoundError si el customer no pertenece al usuario', async () => {
      const firstUser = await createUser()
      const secondUser = await createUser()

      const customer = await createCustomer(firstUser.id_user, {
        name: 'Cliente protegido',
        address: 'Calle protegida',
      })

      await expect(
        deleteCustomerById(secondUser.id_user, customer.id_customer)
      ).rejects.toThrow(NotFoundError)
    })
  })
})
