import { Model, DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Customer from './Customer.js'
import Courier from './Courier.js'

class Order extends Model {}

Order.init(
  {
    id_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_customer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_courier: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: '0.00',
      validate: {
        min: 0,
      },
    },
    action_token: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    request_fingerprint: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
)

Order.belongsTo(Customer, {
  foreignKey: 'id_customer',
  targetKey: 'id_customer',
  as: 'customer',
})

Customer.hasMany(Order, {
  foreignKey: 'id_customer',
  sourceKey: 'id_customer',
  as: 'orders',
})

Order.belongsTo(Courier, {
  foreignKey: 'id_courier',
  targetKey: 'id_courier',
  as: 'courier',
})

Courier.hasMany(Order, {
  foreignKey: 'id_courier',
  sourceKey: 'id_courier',
  as: 'orders',
})

export default Order
