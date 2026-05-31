import { Model, DataTypes } from 'sequelize'
import sequelize from '../database.js'
import Order from './Order.js'
import Product from './Product.js'

class OrderItem extends Model {}

OrderItem.init(
  {
    id_item: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_product: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    modelName: 'OrderItem',
    timestamps: true,
    underscored: true,
  }
)

Product.hasMany(OrderItem, {
  foreignKey: 'id_product',
  sourceKey: 'id_product',
  as: 'orderItems',
})

Order.hasMany(OrderItem, {
  foreignKey: 'id_order',
  sourceKey: 'id_order',
  as: 'orderItems',
})

OrderItem.belongsTo(Product, {
  foreignKey: 'id_product',
  targetKey: 'id_product',
  as: 'product',
})

OrderItem.belongsTo(Order, {
  foreignKey: 'id_order',
  targetKey: 'id_order',
  as: 'order',
})

export default OrderItem
