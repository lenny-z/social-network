require('dotenv').config(); //state this as early as possible to read .env files
const cors = require('cors');
const express = require('express');
const app = express();
// const { Client } = require('pg');
app.use(cors());
app.use(express.json());

const CREDENTIALS = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
}

const { Pool } = require('pg');
const pool = new Pool(CREDENTIALS);

// function testConnectDB(credentials) {
//     const client = new Client(credentials);

//     client.connect()
//         .then(() => console.log('DB test connection successful'))
//         .catch((err) => console.error(err.stack));

//     const query = 'SELECT $1::text as message;';
//     const params = ['DB test query successful'];

//     client.query(query, params)
//         .then((res) => console.log(res.rows[0].message))
//         .catch((err) => console.error(err.stack))
//         .then(() => client.end());
// }

function testConnectDB(pool) {
    const query = 'SELECT $1::text as message;';
    const params = ['DB test query successful'];

    pool.query(query, params)
        .then((res) => console.log(res.rows[0].message))
        .catch((err) => console.error(err.stack));
    // .then(() => client.end());

    // pool.query()
}

testConnectDB(pool);

function prettyJSON(jsonObj) {
    return JSON.stringify(jsonObj, null, 4);
}

//to avoid injection attacks, don't directly concatenate parameters to query
//instead, use parameterized queries

app.post('/login', (req, res) => {
    console.log('POST to /login:');
    console.log(prettyJSON(req.body));
    console.log();
    res.send('yo');
});

const USERS_TABLE = process.env.USERS_TABLE;
const USERNAME_COLUMN = process.env.USERNAME_COLUMN;
const SALTED_PASSWORD_HASHES_TABLE = process.env.SALTED_PASSWORD_HASHES_TABLE;

//todo
// async function getUser(username){
//     const query = `SELECT ${USERNAME_COLUMN} FROM ${USERS_TABLE} WHERE ${USERNAME_COLUMN} = $1;`;
//     const params = [username];
//     const client = new Clien
// }

// async function userExists(username) {
async function userExists(username, pool) {
    console.log(`userExists(${username}):`);
    const query = `SELECT ${USERNAME_COLUMN} FROM ${USERS_TABLE} WHERE ${USERNAME_COLUMN} = $1;`;
    console.log(`query: ${query}`);
    const params = [username];
    // const client = new Client(CREDENTIALS);
    // await client.connect();
    // const res = await client.query(query, params);
    const res = await pool.query(query, params);
    console.log(prettyJSON(res));
    // client.end();
    return res.rowCount > 0;
}

//https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
// by default, argon2id hash stores its own salt
const argon2 = require('argon2');

app.post('/register', async (req, res) => {
    console.log('POST to /register:');
    console.log(prettyJSON(req.body));
    console.log();

    if (await userExists(req.body.username, pool)) {
        res.sendStatus(409);
    } else {
        // const query = `BEGIN; INSERT INTO ${USERS_TABLE}(${USERNAME_COLUMN}) VALUES ($1); COMMIT;`;
        // const password_hash_salt = await argon2.hash(req.body.password);
        // const params = [req.body.username, password_hash_salt];
        // const params = [req.body.username];
        // const client = new Client(CREDENTIALS);
        // const client = new Client(CREDENTIALS);
        // await client.connect();
        const client = await pool.connect();
        try {
            await client.query('BEGIN;');
            var query = `INSERT INTO ${USERS_TABLE}(${USERNAME_COLUMN}) VALUES ($1);`;
            var params = [req.body.username];
            await client.query(query, params);
            // query = `INSERT INTO ${SALTED_PASSWORD_HASHES_TABLE}()`;
            await client.query('COMMIT;');
        } catch (err) {
            await client.query('ROLLBACK;');
            console.error(err);
        } finally {
            // client.end();
            client.release();
        }
    }
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log('Server running on port ' + port);
});