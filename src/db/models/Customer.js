import { Model, DataTypes } from 'sequelize'
import User from './User.js'
import sequelize from '../database.js'

class Customer extends Model {}

Customer.init(
  {
    id_customer: {
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
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  }
)

Customer.belongsTo(User, {
  foreignKey: 'id_user',
  targetKey: 'id_user',
  as: 'user',
})

User.hasMany(Customer, {
  foreignKey: 'id_user',
  sourceKey: 'id_user',
  as: 'customers',
})

export default Customer
