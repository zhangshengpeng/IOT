let mysql = require('mysql')
let socekt
//事件监听与驱动
var EventEmitter = require('events').EventEmitter
var event = new EventEmitter();

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
    io.on('connection', (socket)=>{
        console.log('connect in')
        event.on('sendData', (data)=> {
            io.emit('init', data) 
        });
        socket.on('init',(imsi)=>{
            let sql = `SELECT * FROM iot WHERE imsi = ${imsi} limit 10`
            connection.query(sql,(err,result)=>{
                if(err){ console.log(err) 
                } else {
                    let arr =[]
                    result.forEach(item => {
                        let params = {
                            date: item.date,
                            light: item.light,
                            temp: item.temp
                        }
                        arr.push(params)
                    });
                    let Data = {
                        IMSI: result[result.length-1].IMSI,
                        host: result[result.length-1].host,
                        port: result[result.length-1].port,
                        serialNumber: result[result.length-1].serialNumber,
                        phone: result[result.length-1].phone,
                        date: result[result.length-1].date,
                        list: arr
                    }
                    io.emit('init', Data)
                }
            })
        })
    })
}

exports.Insert = (data)=> {
    let insertTime = new Date()
    let Y = insertTime.getFullYear() + '-';
    let M = (insertTime.getMonth()+1 < 10 ? '0'+(insertTime.getMonth()+1) : insertTime.getMonth()+1) + '-';
    let D = (insertTime.getDate()<10? '0'+insertTime.getDate():insertTime.getDate()) + ' ';
    let h = (insertTime.getHours()<10? '0'+insertTime.getHours():insertTime.getHours()) + ':';
    let m = (insertTime.getMinutes()<10? '0'+insertTime.getMinutes():insertTime.getMinutes());
    let date= Y+M+D+h+m;
    let sql = "INSERT INTO iot(IMSI, host, port, serialNumber, phone, date, temp, light) VALUE(?, ?, ?, ?, ?, ?, ?, ?)";
    let params = [data.IMSI, data.host, data.port, data.serialNumber, data.phone, date, data.temp, data.light]
    connection.query(sql,params, (err, result)=> {
        if(err){
            console.log(err)
        } else {
            var sql = "SELECT date,temp,light from iot where date order by date desc limit 10"
            connection.query(sql,function(err,result){if (err) {console.log(err)}else{ 
            let Data = {
                IMSI: data.IMSI,
                host: data.host,
                port: data.port,
                serialNumber: data.serialNumber,
                phone: data.phone,
                date,
                list: result
            }
            event.emit('sendData',Data)
            }
            })
        }
    })
}

exports.getData = (imsi)=>{
    
}


