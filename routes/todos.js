var express = require('express');
const { isLoggedIn } = require('../helpers/util');
const moment = require('moment/moment');
var router = express.Router();

module.exports = function (db) {
  router.get('/', async function (req, res) {
    console.log(req.url);

    const url = req.url == '/' ? '/todos/?page=1&sortBy=id&sortMode=asc' : `/todos${req.url}`;
    const { title = '', startdate = '', complete = '', operation = 'OR', sortBy = 'id', sortMode = 'asc', deadlineStart = '', deadlineEnd = '', deadline = '', page = 1 } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;
    const query = [];
    const params = [];

    if (title) {
      query.push(`title ilike '%' || $${params.length + 1} || '%'`);
      params.push(title);
    }
    if (complete) {
      query.push(`complete = $${params.length + 1}`);
      params.push(complete);
    }
    if (deadlineStart && deadlineEnd) {
      query.push(`deadline BETWEEN  $${params.length + 1} AND $${params.length + 2}`);
      params.push(deadlineStart, deadlineEnd)
    } else if (deadlineStart) {
      query.push('deadline >= $${params.length + 1}');
      params.push(deadlineStart);
    } else if (deadlineEnd) {
      query.push('deadline <= $${params.length - 1}');
      params.push(deadlineEnd);
    }
    const whereClause = query.length ? `WHERE ${query.join(` ${operation} `)}` : '';
    const sql = `ORDER BY ${'sortBy'} ${sortMode}`

    try {
      const operation = req.query.operation || 'OR';

      const countResult = await db.query(`SELECT COUNT(*) as total FROM todos ${whereClause}`, params);
      const totalRows = countResult.rows[0].total;
      const totalPages = Math.ceil(totalRows / limit);


      const dataResult = await db.query(`SELECT * FROM todos ${whereClause} ORDER BY ${sortBy} ${sortMode} LIMIT ${limit} OFFSET ${offset}`, params);

      console.log(countResult, params);


      dataResult.rows.forEach(row => {
        row.deadline = moment(row.deadline).format('DD MMM YYYY HH:mm');
      })

      res.render('list', {
        data: dataResult.rows,
        users: req.session.user,
        query: req.query,
        operation,
        deadlineStart,
        deadlineEnd,
        offset,
        page,
        totalPages,
        title,
        complete,
        url
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error retrieving data');
    }
  });


  router.get('/add', (req, res, next) => {
    res.render('add', { title: 'Adding Data' });
  });

  router.post('/add', (req, res, next) => {
    const { id } = req.session.user;
    const { title } = req.body;
    const query = `INSERT INTO todos(title, user_id) VALUES($1, $2)`;

    db.query(query, [title, id])
      .then(() => {
        console.log("Data berhasil ditambahkan");
        res.redirect('/todos');
      })
      .catch(err => {
        console.error("Error:", err);
        res.status(500).send("Error adding data to database");
      });
  });

  router.get('/edit/:id', (req, res, next) => {
    const { id } = req.params;
    db.query('SELECT * FROM todos WHERE id = $1', [id], (err, data) => {
      if (err) return res.send(err)
      res.render('edit', { item: data.rows[0] })
      console.log('if exist: ', data.rows[0]);
    });
  });

  router.post('/edit/:id', (req, res, next) => {
    const { id } = req.params;
    const { title, deadline, complete } = req.body;
    const query = `UPDATE todos SET title = $1, deadline = $2, complete = $3 WHERE id = $4`;

    db.query(query, [title, deadline, complete, id], (err, data) => {
      if (err) return res.send(err);
      res.redirect('/todos');
    });
  });

  router.get('/delete/:id', (req, res, next) => {
    const id = req.params.id;
    db.query(`DELETE FROM todos WHERE id = $1`, [id], (err) => {
      if (err) {
        console.error(err);
        return next(err);
      } else {
        console.log('Data deleted successfully');
        return res.redirect('/todos');
      }
    });
  });

  return router;
}

