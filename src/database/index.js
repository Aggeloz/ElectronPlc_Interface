const { ipcRenderer } = require('electron');

let host;
let user;
let pass;
let db;
let data = [];


ipcRenderer.on('reply', (event, reply) => {
    console.log(reply);
});
ipcRenderer.on('dbOK', (event, reply) => {
    console.log(reply);
    if(reply[0]) {
        document.getElementById('dbStatus').innerHTML = 'Status: Connected';
        document.getElementById('dbStatus').style.color = 'Green';
        lock();
    } else {
        document.getElementById('dbStatus').innerHTML = 'Status: Disconnected';
        document.getElementById('dbStatus').style.color = 'Red';
        unlock();
    }
    document.getElementById('host').value = reply[1].host;
    document.getElementById('user').value = reply[1].user;
    document.getElementById('password').value = reply[1].pass;
    document.getElementById('database').value = reply[1].db;
});

ipcRenderer.on('conn-valid', (event, reply) => {
    if (reply.length === 1) {
        console.log(reply);
        alert("Connection to Database was successful");
        document.getElementById('dbStatus').innerHTML = 'Status: Connected';
        document.getElementById('dbStatus').style.color = 'Green';
        lock();
    } else {
        console.log(reply);
        alert("Connection to Database failed " + reply[1]);
        document.getElementById('dbStatus').innerHTML = 'Status: Disconnected';
        document.getElementById('dbStatus').style.color = 'Red';
        unlock();
        
    }
});


function lock() {
    document.getElementById('host').disabled = true;
    document.getElementById('user').disabled = true;
    document.getElementById('password').disabled = true;
    document.getElementById('database').disabled = true;
    document.getElementById('connect').disabled = true;
    document.getElementById('disconnect').disabled = false;
}
function unlock() {
    document.getElementById('host').disabled = false;
    document.getElementById('user').disabled = false;
    document.getElementById('password').disabled = false;
    document.getElementById('database').disabled = false;
    document.getElementById('connect').disabled = false;
    document.getElementById('disconnect').disabled = true;
}

isConnected();
function isConnected() {
    ipcRenderer.send("dbOK");
}

function disconnect() {
    ipcRenderer.send("disconnect");
}

function connect() {
    host = document.getElementById('host').value;
    user = document.getElementById('user').value;
    pass = document.getElementById('password').value;
    db = document.getElementById('database').value;
    data = {host, user, pass, db};


    if (checkEmpty(data) == true) {
        ipcRenderer.send('dbConnection', data);
    }

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