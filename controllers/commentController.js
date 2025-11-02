const { Comment, Article, User } = require('../models') // Assurez-vous d'importer vos modèles

// Fonction utilitaire pour extraire les informations pertinentes de l'auteur
const formatCommentAuthor = (comment) => {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    // Informations de l'auteur (nécessite l'inclusion du modèle User)
    author: {
      id: comment.author.id,
      name: comment.author.name, // Nom de l'utilisateur
      // N'incluez PAS de données sensibles comme le mot de passe ou l'email ici
    },
  }
}

// 1. Ajouter un nouveau commentaire à un article
exports.createComment = async (req, res) => {
  try {
    // ----------------------------------------------------------------------------------
    // ✅ RÊTABLISSEMENT : Utilisation de l'ID de l'utilisateur authentifié (fourni par 'auth')
    const userId = req.user.id
    // ----------------------------------------------------------------------------------

    const { articleId } = req.params
    const { content } = req.body

    // Vérification de base
    if (!content || content.trim().length === 0) {
      return res
        .status(400)
        .json({ error: 'Le contenu du commentaire ne peut pas être vide.' })
    }

    // 1. Vérifier si l'article existe
    const article = await Article.findByPk(articleId)
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé.' })
    }

    // 2. Créer le commentaire
    const newComment = await Comment.create({
      articleId: articleId,
      userId: userId, // Utilise l'ID authentifié
      content: content,
      // isApproved est par défaut à true selon le modèle, pas besoin de le spécifier ici
    })

    // 3. Récupérer le commentaire avec les infos de l'auteur pour le renvoyer au frontend
    const commentWithAuthor = await Comment.findByPk(newComment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
    })

    return res.status(201).json({
      message: 'Commentaire créé avec succès !',
      comment: formatCommentAuthor(commentWithAuthor),
    })
  } catch (error) {
    console.error(
      'Erreur lors de la création du commentaire (avec authentification):',
      error
    )
    return res
      .status(500)
      .json({ error: 'Erreur lors de la création du commentaire.' })
  }
}

// 2. Récupérer tous les commentaires pour un article (Inchangé)
exports.getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params

    // 1. Trouver les commentaires associés à l'article
    const comments = await Comment.findAll({
      where: {
        articleId: articleId,
        // Si vous avez un champ de modération: isApproved: true
      },
      order: [['createdAt', 'ASC']], // Afficher les plus anciens en premier (conversation)
      // Inclure les informations de l'auteur
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name'], // N'inclure que les champs nécessaires
        },
      ],
    })

    // 2. Formater la sortie
    const formattedComments = comments.map(formatCommentAuthor)

    return res.status(200).json(formattedComments)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des commentaires.' })
  }
}

// 3. Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    // L'objet req.user est défini par votre middleware auth
    const requestingUser = req.user

    // 1. Vérification des droits : SEUL L'ADMIN peut supprimer des commentaires.
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({
        error:
          'Accès refusé. Seul un administrateur peut supprimer des commentaires.',
      })
    }

    // 2. Trouver le commentaire
    const comment = await Comment.findByPk(commentId)

    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé.' })
    }

    // 3. Supprimer le commentaire
    await comment.destroy()

    return res
      .status(200)
      .json({ message: 'Commentaire supprimé avec succès.' })
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la suppression du commentaire.' })
  }
}
