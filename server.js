if (process.env.NODE_ENV !== 'production') {
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
const port = process.env.PORT || 8080

// ----------------------------------------------------
// ✅ 1. CORS toujours chargé AVANT tout
// ----------------------------------------------------
const allowedOrigins = [
  'https://adlam-frontend.vercel.app',
  'http://localhost:3000',
]

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    credentials: true,
  })
)

// Pour bien répondre aux requêtes pré-flight
app.options('*', cors())

console.log('✅ Middleware CORS initialisé.')

// ----------------------------------------------------
// 2. Middlewares Express
// ----------------------------------------------------
app.use(express.json())

// ----------------------------------------------------
// 3. Connexion à la base de données
// ----------------------------------------------------
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée.')

    // ----------------------------------------------------
    // 4. Routes principales
    // ----------------------------------------------------
    app.use('/api/auth', authRoutes)
    app.use('/api/articles', articlesRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api', commentRoutes)

    // ----------------------------------------------------
    // 5. Démarrage du serveur
    // ----------------------------------------------------
    app.listen(port, () => {
      console.log(`🚀 Serveur en cours d'exécution sur le port ${port}`)
    })
  })
  .catch((err) => {
    console.error('⚠️ Erreur DB :', err.message)

    app.use('/api/auth', authRoutes)
    app.use('/api/articles', articlesRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/users', userRoutes)
    app.use('/api', commentRoutes)

    app.listen(port, () => {
      console.log(`🚀 Serveur démarré avec erreur DB sur le port ${port}`)
    })
  })
