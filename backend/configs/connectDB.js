const mysql = require('mysql');
// connection to mysql database
const config =
{
    mysql_pool: mysql.createPool({
        host: 'https://th255.ruk-com.in.th/phpMyAdmin/',
        user: 'wavespor_root',
        password: '$eaZ@8))UDo*',
        database: 'wavespor_ecommerce'
    })
}
// const config = 
// {
//     mysql_pool : mysql.createPool({
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database: 'mygirlfriend'
//     })
// }

module.exports = config;
