const { Client } = require('pg');


const client = new Client({
    host: "192.168.1.120",
    user: "Aggelos",
    port: 5432,
    password: "ptolemeo55613",
    database: "TestDB"
});

connect();
function connect() {

    client.connect(err => {
        if (err) {
            console.error('connection error', err.stack)
        } else {
            console.log('connected')
        }
    })
}