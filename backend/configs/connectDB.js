const mysql = require('mysql');
// connection to mysql database
const config = 
{
    mysql_pool : mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'mygirlfriend'
    })
}

module.exports = config;
