const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../services/cloudinary')
const { auth, admin } = require('../middleware/authMiddleware')

// Configurez Multer pour stocker les fichiers en mémoire (temporaire)
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Route d'upload d'image (protégée pour les admins)
router.post('/', auth, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été fourni." })
    } // Téléchargez le fichier sur Cloudinary

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'adlam_blog_articles', // Crée un dossier dans Cloudinary
      }
    ) // Renvoyez l'URL sécurisée au front-end

    res.status(200).json({ imageUrl: result.secure_url })
  } catch (error) {
    // AJOUT DE CETTE LIGNE POUR UN DÉBOGAGE PLUS DÉTAILLÉ
    console.error('Erreur Cloudinary détaillée:', error)
    res
      .status(500)
      .json({ message: "Erreur lors du téléchargement de l'image." })
  }
})

module.exports = router
