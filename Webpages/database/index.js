const { Client } = require('pg');


const client = new Client({
    host: "192.168.1.120",
    user: "Aggelos",
    port: 5432,
    password: "test",
    database: "postgres"
});


function connect() {

    client
        .connect()
        .then(() => console.log('Connected'))
        .catch(err => console.error('error during connection', err.stack))
}