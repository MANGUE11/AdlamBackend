const fs = require('fs')
const path = require('path')
const express = require('express')

const routesFolder = path.join(__dirname, 'routes')

// Fonction pour tester un fichier de route
function testRouteFile(filePath) {
  try {
    const router = require(filePath)

    // Vérifie si c'est un Router Express
    if (!router || !router.stack) {
      console.log(`⚠️  ${filePath} n'est pas un Router valide`)
      return
    }

    // Test de chaque route définie
    router.stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        // Tentative de compilation avec path-to-regexp
        const { path } = layer.route
        const methods = Object.keys(layer.route.methods)
          .join(', ')
          .toUpperCase()
        console.log(`✅ Route OK: [${methods}] ${path}`)
      }
    })
  } catch (err) {
    console.error(`❌ ERREUR dans ${filePath} :`, err.message)
  }
}

// Lire tous les fichiers de routes
fs.readdirSync(routesFolder).forEach((file) => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(routesFolder, file)
    testRouteFile(fullPath)
  }
})
