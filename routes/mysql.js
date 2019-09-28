let mysql = require('mysql')
let socekt
//事件监听与驱动
var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter();

let connection = mysql.createConnection({
    host: '101.132.116.167',
    port: '3306',
    user: 'root',
    password: '1234',
    database: 'mydatabase'
});
connection.connect();
exports.connection = connection

//处理8小时超时问题
var cnt=0;
var conn=function(){
	var sql = "SELECT id FROM userbaseinfo";
   connection.query(sql,function(err,result){ })     
    cnt++;
    console.log("Mysql重连接成功! 次数:"+cnt);
}
setInterval(conn, 3600*1000);

exports.getIo = (io)=>{
    socket = io
    socket.on('connection', (socket)=>{
        console.log('connect in')
    })
}

exports.Insert = (data)=> {
    let insertTime = new Date()
    let Y = insertTime.getFullYear() + '-';
    let M = (insertTime.getMonth()+1 < 10 ? '0'+(insertTime.getMonth()+1) : insertTime.getMonth()+1) + '-';
    let D = (insertTime.getDate()<10? '0'+insertTime.getDate():insertTime.getDate()) + ' ';
    let h = (insertTime.getHours()<10? '0'+insertTime.getHours():insertTime.getHours()) + ':';
    let m = (insertTime.getSeconds()<10? '0'+insertTime.getSeconds():insertTime.getSeconds());
    let date= Y+M+D+h+m;
    let sql = "INSERT INTO iot(IMSI, host, port, serialNumber, phone, date) VALUE(?, ?, ?, ?, ?, ?)";
    let params = [data.IMSI, data.host, data.port, data.serialNumber, data.phone, date]
    connection.query(sql,params, (err, result)=> {
        if(err){
            console.log(err)
        } else {
            console.log(result)
            socekt.emit('message', result)
        }
    })
}

exports.getData = (io)=>{
    var sql = "SELECT * from iot where IMSI order by IMSI desc limit 10"
    connection.query(sql,function(err,result){if (err) {console.log(err)}else{  
    console.log(result)
    io.emit('message',result)}})
}


