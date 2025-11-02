const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { auth } = require('../middleware/authMiddleware') // On importe ton middleware 'auth'

// Route PUT pour la modification du profil utilisateur
// Note que le chemin est '/' car '/api/users' est déjà défini dans server.js
router.put('/profile', auth, userController.updateProfile)

// GET /api/users - Récupère la liste de tous les utilisateurs (sécurisé par `auth` et `admin`)
router.get('/', auth, userController.getAllUsers)

// PATCH /api/users/:id/role - Met à jour le rôle d'un utilisateur (sécurisé par `auth` et `admin`)
router.patch('/:id/role', auth, userController.updateUserRole)

// DELETE /api/users/:id - Supprime un utilisateur (sécurisé par `auth` et `admin`)
router.delete('/:id', auth, userController.deleteUser)

module.exports = router
