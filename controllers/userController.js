// controllers/userController.js
const { User } = require('../models') // Assure-toi que le chemin d'accès à ton modèle est correct
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize') // Nous avons besoin de Op pour l'opération de comparaison "pas égal à"

exports.updateProfile = async (req, res) => {
  // L'ID de l'utilisateur vient de ton middleware 'auth'
  const userId = req.user.id
  const { name, email, password } = req.body

  try {
    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    // Mise à jour des champs si les valeurs sont fournies dans le corps de la requête
    if (name) {
      user.name = name
    }
    if (email) {
      // On vérifie que le nouvel email n'est pas déjà utilisé par un autre utilisateur
      const existingUserWithEmail = await User.findOne({
        where: {
          email,
          id: {
            [Op.ne]: userId, // L'opérateur [Op.ne] signifie "pas égal à"
          },
        },
      })
      if (existingUserWithEmail) {
        return res
          .status(400)
          .json({ message: 'Cet email est déjà utilisé par un autre compte.' })
      }
      user.email = email
    }
    if (password) {
      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
    }

    // On s'assure que le rôle ne peut pas être modifié par cet endpoint
    if (req.body.role) {
      return res
        .status(403)
        .json({ message: "La modification du rôle n'est pas autorisée." })
    }

    await user.save()

    // On renvoie une réponse avec les informations de l'utilisateur mises à jour
    return res.status(200).json({
      message: 'Profil mis à jour avec succès.',
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Erreur lors de la mise à jour du profil.' })
  }
}

// Nouvelle fonction pour lister tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    })
    res.status(200).json(users)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des utilisateurs.' })
  }
}

// Nouvelle fonction pour mettre à jour le rôle d'un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { newRole } = req.body

    // Validation du rôle
    if (newRole !== 'admin' && newRole !== 'visitor') {
      return res.status(400).json({ message: 'Rôle invalide.' })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    user.role = newRole
    await user.save()

    res.status(200).json({ message: 'Rôle mis à jour avec succès.', user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle.' })
  }
}

// Nouvelle fonction pour supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    await user.destroy()
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur." })
  }
}
