var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')

var config = require('./config');
console.log("App starting in: ", config.ENV_NAME);

//var index = require('./routes/index');
//var users = require('./routes/users');

var routesV1_0 = require('./routes/v1.0/routes');

var app = express();

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(function(req, res, next){
  res.ok = function(resData){
    res.status(200).send(resData);
  };
  res.created = function(resData){
    res.status(201).send(resData);
  };
  res.noContent = function(){
    res.status(204).send();
  };
  res.badRequest = function(resData){
    res.status(400).send(resData);
  };
  res.notFound = function(resData){
    res.status(404).send(resData);
  };
  res.serverError = function(resData){
    res.status(500).send(resData);
  };
  res.notAuthorized = function(resData){
     res.status(401).send(resData);
  }
  next();
});

//app.use('/', index);
//app.use('/users', users);
app.use('/api/v1.0/', routesV1_0);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
