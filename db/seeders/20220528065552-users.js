"use strict";

const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { Role } = require("../../app/models");

const names = [
  "Johnny",
  "Fikri",
  "Brian",
  "Ranggawarsita",
  "Jayabaya",
  "Marieffadhlan"
];

module.exports = {
  async up (queryInterface, Sequelize) {
    const password = "123456";
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const timestamp = new Date();

    const roleCustomer = await Role.findOne({
      where: { name: "CUSTOMER" }
    });

    const roleAdmin = await Role.findOne({
      where: { name: "ADMIN" }
    });

    const users = names.map((name) => ({
      name,
      email: `${name.toLowerCase()}@binar.co.id`,
      encryptedPassword,
      roleId: name.toLowerCase() === "marieffadhlan" ? roleAdmin.id : roleCustomer.id, 
      createdAt: timestamp,
      updatedAt: timestamp,
    }))

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", { name: { [Op.in]: names } }, {});
  }
};
