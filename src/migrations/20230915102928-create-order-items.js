'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id"
        },
        allowNull: false
      },

      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Products",
          key: "id"
        },
        allowNull: false
      },

      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderItems');
  }
};