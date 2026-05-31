'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id_item: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id_order',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_product: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id_product',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
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
    })

    await queryInterface.addConstraint('order_items', {
      fields: ['unit_price'],
      type: 'check',
      name: 'check_order_items_unit_price_non_negative',
      where: {
        unit_price: {
          [Sequelize.Op.gte]: 0,
        },
      },
    })

    await queryInterface.addConstraint('order_items', {
      fields: ['quantity'],
      type: 'check',
      name: 'check_order_items_quantity_non_negative',
      where: {
        quantity: {
          [Sequelize.Op.gt]: 0,
        },
      },
    })

    await queryInterface.addConstraint('order_items', {
      fields: ['subtotal'],
      type: 'check',
      name: 'check_order_items_subtotal_non_negative',
      where: {
        subtotal: {
          [Sequelize.Op.gte]: 0,
        },
      },
    })

    await queryInterface.addConstraint('order_items', {
      fields: ['id_order', 'id_product'],
      type: 'unique',
      name: 'unique_order_items_order_product',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_items')
  },
}
