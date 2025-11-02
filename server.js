// server.js

// ----------------------------------------------------
// 1. Chargement Conditionnel des Variables d'Environnement
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
const port = process.env.PORT || 3000

// ----------------------------------------------------
// 2. Configuration CORS (Avec domaine spécifique)
// ----------------------------------------------------
const allowedOrigins = [
  'https://adlam-frontend.vercel.app', // VOTRE FRONTEND
  'http://localhost:5173',
]

const corsOptions = {
  origin: (origin, callback) => {
    // Autorise si l'origine est dans la liste ou si l'origine est indéfinie
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// ----------------------------------------------------
// 3. Middlewares
// ----------------------------------------------------

app.use(express.json())

// ----------------------------------------------------
// GESTION EXPLICITE DES OPTIONS (FIX CORS TENACE)
// ----------------------------------------------------
app.options('*', cors(corsOptions)) // Pré-écoute pour toutes les routes

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
