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
    data = [host, user, pass, db];


    if (checkEmpty(data) == true) {
        ipcRenderer.send('dbConnection', data);
    }
    ipcRenderer.on('reply', (event, reply) => {
        console.log(reply);
    });
};


function checkEmpty(data) {
    for (let i = 0; i < data.length; i++) {
        if(data[i].length === 0) {
            alert('All values must be filled');
            return false;
        }
    }
    return true;
}