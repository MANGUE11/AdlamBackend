// server.js

// ----------------------------------------------------
// 1. Chargement Conditionnel des Variables d'Environnement (CRITIQUE pour Railway)
// Charge le fichier .env UNIQUEMENT en développement local.
// En production, Railway fournit directement les variables.
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')

const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()
// Utilise le port fourni par Railway (process.env.PORT) ou 3000 localement.
const port = process.env.PORT || 3000

// ----------------------------------------------------
// 2. Configuration CORS (TEST UNIVERSEL)
// Nous utilisons une configuration simple pour autoriser toutes les origines (*)
// afin d'éliminer l'erreur CORS. Si cette erreur persiste, le problème n'est pas CORS.
// ----------------------------------------------------
app.use(
  cors({
    origin: '*', // Permet toutes les origines (https://adlam-frontend.vercel.app inclus)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  })
)

// ----------------------------------------------------
// 3. Middlewares
// ----------------------------------------------------

app.use(express.json())

// Tente de se connecter à la base de données
db.sequelize
  .sync({ alter: true }) // 'alter: true' met à jour le schéma sans effacer les données
  .then(() => {
    console.log('Base de données synchronisée.')

    // Les routes sont configurées UNIQUEMENT après que la base de données est prête
    app.use('/api/auth', authRoutes)
    app.use('/api/articles', articlesRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api', commentRoutes)

    app.listen(port, () => {
      // Le serveur écoute bien le port de Railway
      console.log(`Serveur en cours d'exécution sur http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de synchronisation de la base de données :', err)
    process.exit(1) // Force l'arrêt si la DB n'est pas connectable
  })
