const mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : "localhost",
  user     : 'root',
  password : '',
  database : 'user_taske',
  port :"3306"
  
});

connection.connect((err)=> {
  if (err) {
      console.error('Error connecting to database:', err.stack);
      console.log(err);
      return;
  }
  console.log('Connected to database');
});

module.exports = connection;