const mysql = require('mysql2');
// const util = require('util');
/** Mysql connection setup */
const db_config = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    debug: false
};

const pool = mysql.createPool(db_config);

// module.exports = pool;
// module.exports = pool.promise();

// Ping database to check for common exception errors.
// pool.getConnection((err, connection) => {
//     if (err) {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('Database connection was closed.');
//         }
//         if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('Database has too many connections.');
//         }
//         if (err.code === 'ECONNREFUSED') {
//             console.error('Database connection was refused.');
//         }
//     }

//     if (connection) connection.release();

//     return;
// })

// Promisify for Node.js async/await.
// pool.query = util.promisify(pool.query);

module.exports = pool.promise();