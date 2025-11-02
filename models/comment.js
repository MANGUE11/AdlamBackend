'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Un Commentaire appartient à un Article (relation 1-N)
      Comment.belongsTo(models.Article, {
        foreignKey: 'articleId',
        as: 'article',
      })

      // Un Commentaire appartient à un User (relation 1-N)
      Comment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author',
      })
    }
  }
  Comment.init(
    {
      // Clé étrangère vers l'Article
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Clé étrangère vers l'Utilisateur (l'auteur du commentaire)
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Contenu du commentaire (texte long)
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // Optionnel: Champ pour la modération
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Peut être false si vous voulez une modération préalable
      },
    },
    {
      sequelize,
      modelName: 'Comment',
    }
  )
  return Comment
}
