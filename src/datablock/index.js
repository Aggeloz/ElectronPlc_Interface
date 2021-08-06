const { ipcRenderer } = require('electron');

// checkDB();
async function checkDB() {
    ipcRenderer.send('checkDBOK');
}
ipcRenderer.on('isDBOk', (event, data) => {
    // console.log(data);
    if(!data) {
        alert('Please connect to a database before selecting a Datablock!');
        document.getElementById('openFile').disabled = true;
    } else {
        document.getElementById('openFile').disabled = false;
    }
});



async function openDbSel() {
    ipcRenderer.send('openFile');
}

ipcRenderer.on('datablock', (event, data) => {
    console.log(data);
    document.getElementById('dbName').innerHTML = data.name;
});

function deleteBlock() {
    ipcRenderer.send('deleteBlock');
}