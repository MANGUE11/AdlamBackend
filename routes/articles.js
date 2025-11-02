const express = require('express')
const router = express.Router()
const db = require('../models')
const { auth, admin } = require('../middleware/authMiddleware')

// --- ROUTES GET (Obtenir des articles) ---

// Route pour obtenir un article par son ID (publique)
// Cette route doit toujours être placée avant la route générique '/' pour que le routage fonctionne correctement.
router.get('/:id', async (req, res) => {
  try {
    const article = await db.Article.findByPk(req.params.id, {
      include: { model: db.User, as: 'author', attributes: ['name', 'role'] },
    })

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' })
    }

    res.status(200).json(article)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'article." })
  }
})

// Route pour obtenir tous les articles (publique)
// C'est la route générique pour obtenir la liste complète.
router.get('/', async (req, res) => {
  try {
    const articles = await db.Article.findAll({
      include: { model: db.User, as: 'author', attributes: ['name', 'role'] },
    })
    res.status(200).json(articles)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des articles.' })
  }
})

// --- ROUTES POST (Créer un article) ---

// Route pour créer un article (protégée)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      title_adlam,
      title_french,
      title_english,
      content_adlam,
      content_french,
      content_english,
      coverImageUrl,
    } = req.body

    const newArticle = await db.Article.create({
      title_adlam,
      title_french,
      title_english,
      content_adlam,
      content_french,
      content_english,
      coverImageUrl,
      userId: req.user.id,
    })

    res
      .status(201)
      .json({ message: 'Article créé avec succès.', article: newArticle })
  } catch (error) {
    console.error("Erreur de création d'article détaillée:", error)
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'article." })
  }
})

// --- ROUTES PUT (Modifier un article) ---

// Route pour modifier un article par son ID (protégée par auth et admin)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params
    const {
      title_adlam,
      title_french,
      title_english,
      content_adlam,
      content_french,
      content_english,
      coverImageUrl,
    } = req.body

    const article = await db.Article.findByPk(id)
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' })
    }

    // Mise à jour de l'article avec les nouvelles données
    article.title_adlam = title_adlam
    article.title_french = title_french
    article.title_english = title_english
    article.content_adlam = content_adlam
    article.content_french = content_french
    article.content_english = content_english
    article.coverImageUrl = coverImageUrl

    await article.save()

    res.status(200).json({
      message: 'Article mis à jour avec succès.',
      article,
    })
  } catch (error) {
    console.error("Erreur de mise à jour d'article :", error)
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'article." })
  }
})

// --- ROUTES DELETE (Supprimer un article) ---

// Route pour supprimer un article par son ID (protégée par auth et admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params
    const article = await db.Article.findByPk(id)

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' })
    }

    await article.destroy()

    res.status(200).json({ message: 'Article supprimé avec succès.' })
  } catch (error) {
    console.error("Erreur de suppression d'article :", error)
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'article." })
  }
})

module.exports = router
