// routes/auth.js
const express = require('express')
const router = express.Router()
const db = require('../models') // Importez db dans le fichier de route
const crypto = require('crypto')
const nodemailer = require('nodemailer')
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
      role: 'visitor',
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
      { expiresIn: '1h' },
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

// --- MOT DE PASSE OUBLIÉ (ÉTAPE 1 : ENVOI DU MAIL) ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await db.User.findOne({ where: { email } })
    if (!user)
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })

    // Générer un token de 20 caractères
    const token = crypto.randomBytes(20).toString('hex')
    const expires = Date.now() + 3600000 // Valable 1 heure

    // Sauvegarder dans la DB
    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    })

    // Configurer l'envoi
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // ← AJOUTE ÇA
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

    await transporter.sendMail({
      from: 'akweeyo@gmail.com',
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      html: `<p>Vous avez demandé une réinitialisation. Cliquez ici : <a href="${resetUrl}">${resetUrl}</a></p>`,
    })

    res.status(200).json({ message: 'Email envoyé avec succès.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email." })
  }
})

// --- RÉINITIALISATION (ÉTAPE 2 : MISE À JOUR DU MOT DE PASSE) ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await db.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() }, // Vérifie si le token n'est pas expiré
      },
    })

    if (!user)
      return res.status(400).json({ message: 'Token invalide ou expiré.' })

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Mettre à jour l'utilisateur et effacer le token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    })

    res.status(200).json({ message: 'Mot de passe modifié avec succès.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur lors de la réinitialisation.' })
  }
})

module.exports = router
