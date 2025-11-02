'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Méthode 'up' : Créer la table
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Articles', // Nom de la table ciblée
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Supprime les commentaires si l'article est supprimé
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Nom de la table ciblée
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Supprime les commentaires si l'utilisateur est supprimé
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  // Méthode 'down' : Supprimer la table (pour annuler la migration)
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments')
  },
}
