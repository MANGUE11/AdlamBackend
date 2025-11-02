'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Articles', 'coverImageUrl', {
      type: Sequelize.STRING,
      allowNull: true, // L'image n'est pas obligatoire
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles', 'coverImageUrl')
  },
}
