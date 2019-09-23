var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const net = require('net')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

let host = '0.0.0.0'
let port = 8081

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//socket
let sockserver = net.createServer((sock)=>{
  sock.on('data', (data)=>{
    console.log('data：', data.toString('GBK'))
    sock.write("回发数据：",data)
  })
})
sockserver.listen(port, host)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
