var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const net = require('net')
const iconv = require('iconv-lite')

let mySql = require('./routes/mysql');

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
    let str=iconv.decode(data, 'gbk')
    console.log(str)
    var s = str.split('***')
    let ue={
      IMSI: str.slice(2,17),
      host: str.slice(38,53),
      port: str.slice(53,57),
      serialNumber: str.slice(116,135),
      phone: str.slice(197, 208),
      light: s.slice(0, 4),
      temp: s.slice(5,9),
    }
    console.log(ue)
    mySql.Insert(ue)
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
