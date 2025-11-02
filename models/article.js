'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author',
      })
      // AJOUT : Un Article a plusieurs Commentaires
      Article.hasMany(models.Comment, {
        foreignKey: 'articleId',
        as: 'comments',
        onDelete: 'CASCADE', // Supprime les commentaires si l'article est supprimé
      })
    }
  }
  Article.init(
    {
      // Ancien champ 'title' supprimé
      // title: DataTypes.STRING,

      // Nouveaux champs pour le titre multilingue
      title_adlam: DataTypes.STRING,
      title_french: DataTypes.STRING,
      title_english: DataTypes.STRING, // Champs de contenu existants

      content_adlam: DataTypes.TEXT,
      content_french: DataTypes.TEXT,
      content_english: DataTypes.TEXT, // Autres champs existants

      userId: DataTypes.INTEGER,
      coverImageUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Article',
    }
  )
  return Article
}
