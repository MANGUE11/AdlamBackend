require('dotenv').config()
const nodemailer = require('nodemailer')

console.log('EMAIL_USER:', process.env.EMAIL_USER)
console.log('EMAIL_PASS:', process.env.EMAIL_PASS)
console.log('Longueur PASS:', process.env.EMAIL_PASS?.length)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

transporter.sendMail(
  {
    from: 'akweeyo@gmail.com',
    to: 'manguemasysylla13@gmail.com',
    subject: 'Test Gmail',
    text: 'Ça marche !',
  },
  (err, info) => {
    if (err) console.error('ERREUR:', err.message)
    else console.log('SUCCÈS:', info.response)
  },
)
