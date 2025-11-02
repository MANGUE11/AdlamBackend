// server.debug.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const port = process.env.PORT || 8080

// Middleware JSON
app.use(express.json())

// Test simple de route
app.get('/', (req, res) => {
  res.send('✅ Serveur minimal OK')
})

// Routes “dummy” pour tester path-to-regexp
app.get('/api/articles/:id', (req, res) => {
  res.json({ message: 'Article ID reçu', id: req.params.id })
})

app.get('/api/articles', (req, res) => {
  res.json({ message: 'Liste des articles OK' })
})

// Lancement serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Serveur minimal en cours d'exécution sur le port ${port}`)
})
