import { Model, DataTypes } from 'sequelize'
import sequelize from '../database.js'

class User extends Model {}

User.init(
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
      set(value) {
        this.setDataValue('email', value.toLowerCase())
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'owner'),
      allowNull: true,
      defaultValue: 'owner',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
)

export default User
