import { DataTypes, Model } from 'sequelize'
import User from './User.js'
import sequelize from '../database.js'

class RefreshToken extends Model {}

RefreshToken.init(
  {
    id_rtoken: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_token',
    timestamps: false,
  }
)

RefreshToken.belongsTo(User, {
  foreignKey: 'id_user',
  targetKey: 'id_user',
  as: 'user',
})

User.hasMany(RefreshToken, {
  foreignKey: 'id_user',
  sourceKey: 'id_user',
  as: 'refreshTokens',
})

export default RefreshToken
