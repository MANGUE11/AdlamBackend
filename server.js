// server.js

// ----------------------------------------------------
// 1. Chargement Conditionnel des Variables d'Environnement
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const express = require('express')
// Le package 'cors' est omis.

const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()
const port = process.env.PORT || 8080

// ----------------------------------------------------
// 2. CONFIGURATION CORS MANUELLE
// ----------------------------------------------------
app.use((req, res, next) => {
  // Autorise TOUTES les origines (*).
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  // Gestion des requêtes Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
  } else {
    next()
  }
})

// ----------------------------------------------------
// 3. Middlewares standard et Routes
// ----------------------------------------------------

app.use(express.json())

// Tente de se connecter à la base de données et de synchroniser
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
      // console.log(`Serveur en cours d'exécution sur http://localhost:${port}`)
      console.log(`✅ Serveur en cours d'exécution sur le port ${port}`)
    })
  })
  .catch((err) => {
    // 🔥 MODIFICATION CRITIQUE :
    // Au lieu de planter (process.exit(1)), on enregistre l'erreur
    // et on essaie quand même de démarrer le serveur Express.
    console.error(
      'Erreur de synchronisation de la base de données - Démarrage forcé du serveur :',
      err
    )

    // On doit quand même démarrer le serveur si la DB est l'unique raison de l'échec.
    // Cette étape est vitale pour que Railway arrête de renvoyer des 502/connection refused.
    // Si la DB est en panne, les requêtes échoueront plus tard avec des 500, mais l'app sera joignable.

    app.use('/api/auth', authRoutes)
    app.use('/api/articles', articlesRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api', commentRoutes)

    app.listen(port, () => {
      console.log(
        `Serveur démarré AVEC une erreur de DB sur http://localhost:${port}`
      )
    })
  })
