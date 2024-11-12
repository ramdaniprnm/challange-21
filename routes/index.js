var express = require('express');
const { hashPassword } = require('../helpers/utiliti');
var router = express.Router();


module.exports = function (db) {

  router.get('/', (req, res, next) => {
    res.render('login')
  })

  router.get('/register', (req, res, next) => {
    res.render('register')
  })

  router.post('/register', async function (req, res, next) {
    const { email, password, retype } = req.body
    try {
      if (password !== retype) {
        return res.send("password doesn't match")
      }
      const { row } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email])
      if (row) {
        return res.send('email already exist')
      }
      const { rows: users } = await db.query('INSERT INTO users(email, password) VALUES($1, $2) RETURNING *', [email, hashPassword(password)])
      console.log(users)
      res.redirect('/users')
    } catch (e) {
      console.log(e);
      res.send('somenthing went wrong!')
    }
  })

  return router;
}