'use strict'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id_order: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      action_token: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      id_customer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id_customer',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_courier: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'couriers',
          key: 'id_courier',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      request_fingerprint: {
        type: Sequelize.STRING(64),
        allowNull: false,
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

    await queryInterface.addConstraint('orders', {
      fields: ['total_amount'],
      type: 'check',
      name: 'check_order_total_amount_non_negative',
      where: {
        total_amount: { [Sequelize.Op.gte]: 0 },
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders')
  },
}
