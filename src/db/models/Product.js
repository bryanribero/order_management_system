import { Model, DataTypes } from 'sequelize'
import sequelize from '../database.js'
import User from './User.js'

class Product extends Model {}

Product.init(
  {
    id_product: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sku: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.01,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
)

Product.belongsTo(User, {
  foreignKey: 'id_user',
  targetKey: 'id_user',
  as: 'user',
})

User.hasMany(Product, {
  foreignKey: 'id_user',
  sourceKey: 'id_user',
  as: 'products',
})

export default Product
