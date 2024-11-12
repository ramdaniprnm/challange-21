var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function (db) {
  router.get('/', function (req, res) {
    db.query('SELECT * FROM todos')
      .then(function (result) {
        res.render('list', { data: result.rows });
      })
      .catch(function (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error retrieving data');
      });
  });

  router.get('/add', (req, res, next) => {
    res.render('add', { title: 'Adding Data' });
  });

  router.post('/add', (req, res, next) => {
    const { title, complete, deadline } = req.body;
    const query = `INSERT INTO todos (title, complete, deadline) VALUES ($1, $2, $3)`;
    db.query(query, [title, complete, deadline], (err, data) => {
      if (err) {
        console.error("error details", err);
        return res.status(500).send("Error adding user to database");
      } else {
        console.log('User added successfully');
        return res.redirect('/');
      }
    });
  });

  router.get('/update/:id', (req, res, next) => {
    const id = req.params.id;
    const query = `SELECT * FROM todos WHERE id = $1`;
    db.query(query, [id], (err, data) => {
      if (err) {
        console.error("error details", err);
        return res.status(500).send("Error adding user to database");
      } else {
        console.log('User added successfully');
        return res.render('update', { data: data.rows });
      }
    });
  });

  router.post('/update/:id', (req, res, next) => {
    const id = req.params.id;
    const { title, complete, deadline } = req.body;
    const query = `UPDATE todos SET title = $1, complete = $2, deadline = $3 WHERE id = $4`;
    db.query(query, [title, complete, deadline, id], (err, data) => {
      if (err) {
        console.error("error details", err);
        return res.status(500).send("Error adding user to database");
      } else {
        console.log('User added successfully');
        return res.redirect('/');
      }
    });
  });



  return router;
}
