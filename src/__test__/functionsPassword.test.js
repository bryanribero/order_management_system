import { hashPassword, comparePassword } from '../services/auth.service.js'

describe('Funciones de password', () => {
  describe('hashPassword', () => {
    it('Debera generar un hash diferente a la contraseña original', async () => {
      const password = '12345678'
      const hash = await hashPassword(password)

      expect(hash).not.toBe(password)
    })

    it('Debe devolver un string', async () => {
      const password = '123456789'
      const hash = await hashPassword(password)

      expect(typeof hash).toBe('string')
    })

    it('Debe generar diferentes hashes para la misma contraseña', async () => {
      const password = '13243245234'

      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('Lanza un TypeError cuando la contraseña no es un string', async () => {
      const password = 12345678

      await expect(hashPassword(password)).rejects.toThrow(
        'La contraseña debe ser un string'
      )
    })
  })

  describe('comparePassword', () => {
    it('Debe de devolver true si la contraseña coincide con el hash', async () => {
      const password = 'holaPrueba'
      const hash = await hashPassword(password)

      const result = await comparePassword(password, hash)

      expect(result).toBe(true)
    })

    it('Debe de devolver false si la contraseña no coincide con el hash', async () => {
      const password = 'holaPrueba'
      const hash = await hashPassword(password)

      const result = await comparePassword('contraseñaIncorrecta', hash)

      expect(result).toBe(false)
    })

    it('Lanza un TypeError cuando la contraseña no es un string', async () => {
      const password = 12345678

      const hash = hashPassword(String(password))

      await expect(comparePassword(password, hash)).rejects.toThrow(
        'La contraseña debe ser un string'
      )
    })
  })
})
