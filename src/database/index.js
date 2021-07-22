const { ipcRenderer } = require('electron');

let host;
let user;
let pass;
let db;
let data = [];

function connect() {
    host = document.getElementById('host').value;
    user = document.getElementById('user').value;
    pass = document.getElementById('password').value;
    db = document.getElementById('database').value;
    data.push(host,user,pass,db);
    ipcRenderer.send('dbConnection', data);
};