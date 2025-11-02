// routes/auth.js
const express = require('express')
const router = express.Router()
const db = require('../models') // Importez db dans le fichier de route

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Route d'inscription pour un nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await db.User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    }

    // Hachez le mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Créez le nouvel utilisateur avec le rôle par défaut 'visitor'
    const newUser = await db.User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    })

    res
      .status(201)
      .json({ message: 'Utilisateur créé avec succès.', user: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Erreur lors de l'inscription." })
  }
})

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifiez l'existence de l'utilisateur
    const user = await db.User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    // Vérifiez le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' })
    }

    // Créez et signez le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la connexion.' })
  }
})

router.get('/info', async (req, res) => {
  try {
    res.status(200).json({ message: 'Bonjour Masy !' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'article." })
  }
})

module.exports = router
