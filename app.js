var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var { Pool } = require('pg');
var flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const { isLoggedIn } = require('./helpers/util');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'Bandung123',
  port: 5432,
  database: 'bread'
});

// app.use('/', indexRouter)
// app.use('/todos', todosRouter)

var indexRouter = require('./routes/index')(pool);
var todosRouter = require('./routes/todos')(pool);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ramdani',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(flash());
app.use(fileUpload());


app.use('/', indexRouter);
app.use('/todos', isLoggedIn, todosRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

