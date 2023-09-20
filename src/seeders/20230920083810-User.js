'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert('Users', [{
        first_name: "samik",
        last_name: "shakya",
        email: "samik@gmail.com",
        password: "$2b$12$v23M3S2Tock4F7FVke6DCewqyyChSK9kSKLUgghs5T7cB/QLgMntq", //samik123
      },
      {
        first_name: "rahul",
        last_name: "neupane",
        email: "rahul@gmail.com",
        password: "$2b$12$v23M3S2Tock4F7FVke6DCewqyyChSK9kSKLUgghs5T7cB/QLgMntq", //samik123
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};