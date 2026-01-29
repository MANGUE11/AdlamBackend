'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Un utilisateur a plusieurs articles
      User.hasMany(models.Article, {
        foreignKey: 'userId',
        as: 'articles',
      })
      // AJOUT : Un utilisateur a plusieurs Commentaires
      User.hasMany(models.Comment, {
        foreignKey: 'userId',
        as: 'comments',
      })
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING(191),
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING, // 'admin' ou 'visitor'
        defaultValue: 'visitor',
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  )
  return User
}
