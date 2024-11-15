var express = require('express');
const { hashPassword, comparePassword, isLoggedIn } = require('../helpers/util');
var router = express.Router();
const path = require('path')

module.exports = function (db) {

  router.get('/', function (req, res, next) {
    res.render('login', { errorMessage: req.flash('errorMessage'), successMessage: req.flash('successMessage') });
  });

  router.post('/login', async function (req, res, next) {
    const { email, password } = req.body;
    console.log('session before login:', req.session.user);

    try {
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email])
      if (rows.length == 0) {
        req.flash('errorMessage', "email doesn't exist!")
        return res.redirect('/')
      }

      if (!comparePassword(password, rows[0].password)) {
        req.flash('errorMessage', "password is wrong!")
        return res.redirect('/')
      }
      req.session.user = {
        id: rows[0].id,
        email: rows[0].email,
        avatar: rows[0].avatar
      };
      console.log('session after login:', req.session.user);
      res.redirect('/todos');
    } catch (e) {
      console.log(e);
      req.flash('errorMessage', "something went wrong!")
      res.redirect('/');
    }
  });

  router.get('/register', (req, res, next) => {
    res.render('register');
  });

  router.post('/register', async function (req, res, next) {
    const { email, password, retype } = req.body;
    try {
      if (password !== retype) {
        req.flash('successMessage', "please sign in!")
        return res.redirect('/register')
      }
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
      if (rows.length > 0) {
        req.flash('errorMessage', "email already exist!")
        return res.redirect('/register')
      }
      const { rows: users } = await db.query('INSERT INTO users(email, password) VALUES($1, $2) RETURNING *', [email, hashPassword(password)]);

      req.session.user = {
        id: users[0].id,
        email: users[0].email,
        avatar: users[0].avatar
      };
      res.redirect('/');
    } catch (e) {
      console.log(e);
      req.flash('errorMessage', "something went wrong!")
    }
  });

  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  })

  router.get('/avatar', isLoggedIn, function (req, res) {
    const avatar = req.session.user ? req.session.user.avatar : 'default.png'
    res.render('avatar', { avatar });
  })

  router.post('/avatar', isLoggedIn, function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const avatar = req.files.avatar;
    const fileName = `${Date.now()} - ${avatar.name}`;
    const uploadPath = path.join(__dirname, '..', 'public', 'avatars', fileName);

    // Use the mv() method to place the file somewhere on your server
    avatar.mv(uploadPath, function (err) {
      if (err)
        return res.status(500).send(err);

      db.query('UPDATE users SET avatar = $1 WHERE id = $2', [fileName, req.session.user.id], (err) => {
        req.session.user.avatar = fileName
        res.redirect('/todos');
      })
    });
  });


  return router;
}

