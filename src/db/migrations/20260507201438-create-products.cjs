'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id_product: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id_user',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sku: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    })

    await queryInterface.addConstraint('products', {
      fields: ['stock'],
      type: 'check',
      where: {
        stock: {
          [Sequelize.Op.gte]: 0,
        },
      },
      name: 'products-stock-non-negative',
    })

    await queryInterface.addConstraint('products', {
      fields: ['price'],
      type: 'check',
      where: {
        price: {
          [Sequelize.Op.gt]: 0,
        },
      },
      name: 'products_price_gt',
    })

    await queryInterface.addIndex('products', ['id_user', 'sku'], {
      unique: true,
      name: 'products_id_user_sku_active_unique',
      where: {
        deleted_at: null,
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products')
  },
}
