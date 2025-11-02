'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajoute les nouvelles colonnes à la table 'Articles'
    await queryInterface.addColumn('Articles', 'title_adlam', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('Articles', 'title_french', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('Articles', 'title_english', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    // Supprime les nouvelles colonnes si on annule la migration
    await queryInterface.removeColumn('Articles', 'title_adlam')
    await queryInterface.removeColumn('Articles', 'title_french')
    await queryInterface.removeColumn('Articles', 'title_english')
  },
}
