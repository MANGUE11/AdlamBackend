// server.js

// ----------------------------------------------------
// 1. Chargement Conditionnel des Variables d'Environnement
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const express = require('express')
// L'import de 'cors' N'EST PLUS NÉCESSAIRE car nous allons injecter les headers manuellement
// const cors = require('cors');

const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()
const port = process.env.PORT || 3000

// ----------------------------------------------------
// 2. CONFIGURATION CORS MANUELLE ET DÉFINITIVE
// Cette approche est la plus robuste lorsque le package 'cors' pose problème
// ----------------------------------------------------
const FRONTEND_URL = 'https://adlam-frontend.vercel.app'

app.use((req, res, next) => {
  // 1. Autorise spécifiquement le domaine Vercel.
  res.header('Access-Control-Allow-Origin', FRONTEND_URL)

  // 2. Autorise les méthodes HTTP que votre API utilise
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')

  // 3. Autorise les en-têtes nécessaires (Content-Type, Authorization, etc.)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  res.header('Access-Control-Allow-Credentials', 'true')

  // 4. Gestion des requêtes Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.sendStatus(204) // Répond OK sans contenu pour le navigateur
  } else {
    next()
  }
})

// ----------------------------------------------------
// 3. Middlewares
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
