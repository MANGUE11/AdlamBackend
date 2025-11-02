const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  // Récupérez l'en-tête Authorization
  const authHeader = req.header('Authorization')

  // Vérifiez si l'en-tête est présent et a le format 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Format de token invalide (attendu: Bearer <token>).' })
  }

  // Extrait le token (enlève "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // 1. Vérifiez le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 2. Attachez l'ID utilisateur à req.auth pour le contrôleur (en supposant que le token contient userId)
    //  req.auth = { userId: decoded.userId } // UTILISEZ req.auth comme attendu par le contrôleur

    // Si vous utilisez req.user dans d'autres parties du code, attachez-le aussi
    req.user = decoded

    next()
  } catch (e) {
    // Cette partie est correcte et renvoie du JSON 401
    res.status(401).json({ message: "Le token n'est pas valide ou a expiré." })
  }
}

const admin = (req, res, next) => {
  // Le middleware 'admin' fonctionne maintenant car req.user est défini ci-dessus
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé. Vous n'êtes pas un administrateur." })
  }
}

module.exports = { auth, admin }
