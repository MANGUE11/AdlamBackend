// server.js
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// --- DEBUT CONFIGURATION CORS ---

// ATTENTION: REMPLACER 'VOTRE_URL_FRONTEND_VERCEL' par l'URL exacte de votre application React Vercel
const allowedOrigins = [
  'https://adlam-frontend.vercel.app/',
  'http://localhost:5173',
  // Ajoutez ici d'autres domaines si nécessaire
]

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Autorise si l'origine est dans la liste ou si l'origine est indéfinie (requêtes internes, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // Refuse si l'origine n'est pas autorisée
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Autorise l'envoi de cookies d'authentification ou de tokens (dans le cas d'une session/cookie)
  })
)

// --- FIN CONFIGURATION CORS ---

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
      // Remarquez que la console.log locale reste, mais le serveur écoute bien le port de Railway
      console.log(`Serveur en cours d'exécution sur http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de synchronisation de la base de données :', err)
    process.exit(1)
  })
