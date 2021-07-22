const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '192.168.1.120',
        user: 'Aggelos',
        password: 'aggel0s100v0',
        database: 'TestDB',
    },
});


// const db = knex({
//     client: 'pg',
//     // connection: 'postgresql://postgres:hunter3@localhost/bigdata03',
//     connection: process.env.DB_CONNECTION,
// });

db
    .select('*')
    .from("TestTable")
    .then(function (users) {
        console.log(users);
        // [ { id: 1, description: 'Burrito', ... } ]
    })
    .catch(err => console.log(err.stack));