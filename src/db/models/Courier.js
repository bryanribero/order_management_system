import { Model, DataTypes } from 'sequelize'
import sequelize from '../database.js'
import User from './User.js'

class Courier extends Model {}

Courier.init(
  {
    id_courier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Courier',
    tableName: 'couriers',
    timestamps: true,
    underscored: true,
  }
)

Courier.belongsTo(User, {
  foreignKey: 'id_user',
  targetKey: 'id_user',
  as: 'user',
})

User.hasMany(Courier, {
  foreignKey: 'id_user',
  sourceKey: 'id_user',
  as: 'couriers',
})

export default Courier
