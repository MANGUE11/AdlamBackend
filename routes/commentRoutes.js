const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
// Assurez-vous d'avoir votre middleware d'authentification
const { auth } = require('../middleware/authMiddleware') // On importe ton middleware 'auth'

// ROUTE 1 : POST un nouveau commentaire sur un article (Nécessite AUTHENTIFICATION)
// POST /api/articles/:articleId/comments
router.post(
  '/articles/:articleId/comments',
  auth, // ✅ AUTHENTIFICATION RÉTBLIE
  commentController.createComment
)

// ROUTE 2 : GET les commentaires d'un article spécifique (Pas d'authentification requise pour la lecture)
// GET /api/articles/:articleId/comments
router.get(
  '/articles/:articleId/comments',
  commentController.getArticleComments
)

// ROUTE 3 : DELETE un commentaire (Nécessite AUTHENTIFICATION et RÔLE ADMIN)
// DELETE /api/comments/:commentId
router.delete('/comments/:commentId', auth, commentController.deleteComment)

module.exports = router
