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
// L'import du module dotenv n'est plus nécessaire car nous utilisons require('dotenv').config() ci-dessus.
// const dotenv = require('dotenv')

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
// 2. Configuration CORS (Le Fix)
// ----------------------------------------------------

// ATTENTION: Assurez-vous que l'URL ne contient PAS de slash à la fin (ex: 'https://adlam-frontend.vercel.app')
const allowedOrigins = [
  'https://adlam-frontend.vercel.app', // <-- Corrigé (sans le slash final)
  'http://localhost:5173',
  // Ajoutez ici d'autres domaines si nécessaire
]

const corsOptions = {
  origin: (origin, callback) => {
    // Si l'origine est autorisée OU s'il n'y a pas d'origine (requêtes internes, outils comme Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // Refuse si l'origine n'est pas autorisée
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204, // Bonne pratique pour les requêtes OPTIONS
}

app.use(cors(corsOptions))

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
