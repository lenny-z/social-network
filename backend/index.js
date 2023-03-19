require('dotenv').config(); // State this as early as possible to read .env files
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

// const CREDENTIALS = {
//     user: process.env.PGUSER,
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     password: process.env.PGPASSWORD,
//     port: process.env.PGPORT
// }

// const { Pool } = require('pg');
// const pool = new Pool(CREDENTIALS);

const pool = require('./pool.js').pool;

// To avoid injection attacks, don't directly concatenate parameters to query
// Instead, use parameterized queries

function testConnectDB(pool) {
    const query = 'SELECT $1::text as message;';
    const params = ['DB test query successful'];

    pool.query(query, params)
        .then((res) => console.log(res.rows[0].message + '\n'))
        .catch((err) => console.error(err.stack));
}

testConnectDB(pool);

app.post('/login', (req, res) => {
    res.send('yo');
});

const USERS_TABLE = process.env.USERS_TABLE;
const ID_COLUMN = process.env.ID_COLUMN; // Assumes that all serial primary key columns share the same name
const EMAIL_COLUMN = process.env.EMAIL_COLUMN;
const util = require('./util.js');

async function userExists(username, pool) {
    console.log(`userExists(${username}, pool):`);

    const query = `SELECT EXISTS(SELECT ${ID_COLUMN} FROM ${USERS_TABLE} WHERE ${EMAIL_COLUMN} = $1);`;
    console.log(`query: ${query}`)

    const params = [username];
    console.log(`params: ${params}`);

    const res = await pool.query(query, params);
    console.log(`res: ${util.prettyJSON(res)}`);

    return res.rows[0].exists;
}

// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
// By default, argon2id digest stores its own salt
const argon2 = require('argon2');
const SALTED_PASSWORD_HASHES_TABLE = process.env.SALTED_PASSWORD_HASHES_TABLE;
const SALTED_PASSWORD_HASH_COLUMN = process.env.SALTED_PASSWORD_HASH_COLUMN;
const USER_ID_COLUMN = process.env.USER_ID_COLUMN;

app.post('/register', async (req, res) => {
    console.log('POST to /register:');

    if (await userExists(req.body.username, pool)) {
        res.sendStatus(409); // 409 Conflict
    } else {
        const client = await pool.connect();
        try {
            await client.query('BEGIN;');

            var query = `INSERT INTO ${USERS_TABLE}(${EMAIL_COLUMN}) VALUES ($1);`;
            var params = [req.body.username];
            await client.query(query, params);

            const salted_password_hash = await argon2.hash(req.body.password);
            query = `INSERT INTO ${SALTED_PASSWORD_HASHES_TABLE}(${USER_ID_COLUMN}, ${SALTED_PASSWORD_HASH_COLUMN}) VALUES
            ((SELECT ${ID_COLUMN} FROM ${USERS_TABLE} WHERE ${EMAIL_COLUMN} = $1), $2);`;
            params = [req.body.username, salted_password_hash];
            await client.query(query, params);

            await client.query('COMMIT;');
            res.sendStatus(201); // 201 Created
        } catch (err) {
            await client.query('ROLLBACK;');
            console.error(err);
            res.sendStatus(500); // 500 Internal Server Error
        } finally {
            client.release();
        }
    }
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server running on port ${port}\n`);
});