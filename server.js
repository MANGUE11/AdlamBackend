// ----------------------------------------------------
// 1. Chargement conditionnel des variables d'environnement
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const db = require('./models')

// Importation des routes
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

// Initialisation de l'application Express
const app = express()
const port = process.env.PORT || 8080

// ----------------------------------------------------
// 2. Configuration CORS (Vercel + local)
// ----------------------------------------------------
const allowedOrigins = [
  'https://adlam-frontend.vercel.app', // front en prod
  'http://localhost:3000', // dev local
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans header Origin (Postman, etc.)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
)

// Réponse automatique pour les requêtes OPTIONS (preflight)
app.options('*', cors())

// ----------------------------------------------------
// 3. Middlewares standards
// ----------------------------------------------------
app.use(express.json())

// ----------------------------------------------------
// 4. Connexion et synchronisation de la base de données
// ----------------------------------------------------
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Connexion à la base de données réussie et synchronisée.')
    startServer()
  })
  .catch((err) => {
    console.error(
      '⚠️ Erreur de synchronisation de la base de données. Le serveur démarre quand même :',
      err.message
    )
    startServer()
  })

// ----------------------------------------------------
// 5. Fonction de démarrage du serveur
// ----------------------------------------------------
function startServer() {
  // Routes principales
  app.use('/api/auth', authRoutes)
  app.use('/api/articles', articlesRoutes)
  app.use('/api/upload', uploadRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api', commentRoutes)

  // Écoute sur toutes les interfaces pour Railway ou local
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`)
  })
}
