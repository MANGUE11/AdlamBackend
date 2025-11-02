// server.js
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./models')
const authRoutes = require('./routes/auth')
const articlesRoutes = require('./routes/articles')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/userRoutes') // Assure-toi que ce chemin est correct
const commentRoutes = require('./routes/commentRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
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
    app.use('/api/users', userRoutes) // Utilise la nouvelle route pour les utilisateurs
    app.use('/api', commentRoutes)

    app.listen(port, () => {
      console.log(`Serveur en cours d'exécution sur http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Erreur de synchronisation de la base de données :', err)
    process.exit(1)
  })
