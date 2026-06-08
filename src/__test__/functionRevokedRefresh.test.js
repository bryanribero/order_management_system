import sequelize from '../db/database.js'
import User from '../db/models/User.js'
import { revokedOldRefreshToken } from '../services/auth/utils/tokens.utils.js'
import RefreshToken from '../db/models/RefreshToken.js'

afterEach(async () => {
  await User.destroy({
    where: {},
    force: true,
  })
})

afterAll(async () => {
  await sequelize.close()
})

describe('revokedOldRefreshToken', () => {
  it('debería revocar todos los token de refresh activo', async () => {
    const user = await User.create({
      email: `test-${crypto.randomUUID()}@hotmail.com`,
      password: 'Testeocontra',
    })

    const token1 = await RefreshToken.create({
      id_user: user.id_user,
      token_hash: 'Hash-token1',
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    const token2 = await RefreshToken.create({
      id_user: user.id_user,
      token_hash: 'Hash-token2',
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    expect(token1.revoked_at).toBeNull()
    expect(token2.revoked_at).toBeNull()

    await revokedOldRefreshToken(user.id_user)

    const updatedToken1 = await RefreshToken.findByPk(token1.id_rtoken)
    const updatedToken2 = await RefreshToken.findByPk(token2.id_rtoken)

    expect(updatedToken1.revoked_at).not.toBeNull()
    expect(updatedToken2.revoked_at).not.toBeNull()
  })

  it('no debería lanzar un error si el usuario no existe', async () => {
    await expect(revokedOldRefreshToken(9999)).resolves.toBeUndefined()
  })

  it('debería lanzar un error si idUser es undefined', async () => {
    await expect(revokedOldRefreshToken()).rejects.toThrow()
  })

  it('debería lanzar un error si idUser no es Number', async () => {
    await expect(revokedOldRefreshToken('abd')).rejects.toThrow()
  })
})
