// server.js

// ----------------------------------------------------
// 1. Chargement Conditionnel des Variables d'Environnement
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const express = require('express')
// Le package 'cors' est désormais omis car nous injectons les en-têtes manuellement.
// Assurez-vous d'avoir bien fait 'npm uninstall cors' et un 'git add .'

const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()
const port = process.env.PORT || 3000

// ----------------------------------------------------
// 2. CONFIGURATION CORS MANUELLE UNIVERSELLE (La solution la plus robuste)
// Cette solution envoie l'en-tête Access-Control-Allow-Origin: * pour autoriser Vercel.
// ----------------------------------------------------
app.use((req, res, next) => {
  // Autorise TOUTES les origines (*).
  res.header('Access-Control-Allow-Origin', '*')

  // Autorise les méthodes HTTP
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')

  // Autorise les en-têtes (critique pour les tokens d'authentification)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  // Gestion des requêtes Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.sendStatus(204) // Répond OK sans contenu pour le navigateur
  } else {
    next()
  }
})

// ----------------------------------------------------
// 3. Middlewares standard et Routes
// ----------------------------------------------------

app.use(express.json())

// Tente de se connecter à la base de données
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Base de données synchronisée.')

    // Les routes sont configurées UNIQUEMENT après que la base de données est prête
    app.use('/api/auth', authRoutes)
    app.use('/api/articles', articlesRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api', commentRoutes)

    app.listen(port, () => {
      console.log(`Serveur en cours d'exécution sur http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de synchronisation de la base de données :', err)
    process.exit(1)
  })
