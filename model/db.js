const mysql = require("mysql");

//local
const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'dlwnsgml',
  acquireTimeout : 10000,
  connectTimeout : 10000,
  multipleStatements: true,
})


conn.connect(function(error){
  if(error){
    console.log(error);
  }else{
    console.log("connected");
  }
})

module.exports = conn;