const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '192.168.56.1',
    database: 'innovatube',
    password: '010601',
    port: 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

module.exports = pool;