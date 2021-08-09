const os = require('os');
const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());
let status = document.getElementById('dbStatus');
function checkDB() {
    ipcRenderer.invoke('checkDB').then((result) => {
        storage.has('databaseStats', function (error, hasDatabaseStatsKey) {
            if (error) throw error;
    
            if(hasDatabaseStatsKey) {
                console.log('There are Database Stats');
                let stats = storage.getSync('databaseStats');
                
                if(result) {
                    status.innerHTML = 'Connected';
                    status.style.color = 'Green';

                } else {
                    status.innerHTML = 'Not connected';
                    status.style.color = 'Red';
                }

                document.getElementById('dbHost').innerHTML = stats.host;
                document.getElementById('dbName').innerHTML = stats.database;
    
            } else {
                console.log('There is no Database Stats');
            }
        });
    }).catch((err) => {
        console.log('Error:', err);
    });
    

}


function checkDatablock() {
    storage.has('parsedDatablock', function (error, hasParsedBlock) {
        if (error) throw error;
        if (hasParsedBlock) {
            let datablock = storage.getSync('parsedDatablock');
            document.getElementById('datablockName').innerHTML = "\"" + datablock.name + "\""
        } else {
            console.log('No parsed Datablock');
        }
    })
}

function getPLC() {
    storage.has('plcStats', function(err, hasPlcStats) {
        if (err) throw err;
        if(hasPlcStats) {
            let stats = storage.getSync('plcStats')
            document.getElementById('plcIp').innerHTML = stats.plc.host;
            document.getElementById('plcPort').innerHTML = stats.plc.port;
            document.getElementById('plcRack').innerHTML = stats.plc.rack;
            document.getElementById('plcSlot').innerHTML = stats.plc.slot;
        }
    })
}

function showValues() {
    ipcRenderer.send('showDBValues');
}


function checkPLC() {
    ipcRenderer.send('checkPLC');
}

function initPLC() {
    ipcRenderer.send('initPLC');
    setTimeout(() => { ipcRenderer.send('checkAppStatus', 1)}, 500);
}
function stopPLC() {
    ipcRenderer.send('stopPLC');
    setTimeout(() => { ipcRenderer.send('checkAppStatus', 0) }, 500);

}
function toggleInsert() {
    ipcRenderer.send('toggleInsert');
    setTimeout(() => { ipcRenderer.send('checkInsert');}, 500);
}

ipcRenderer.on('noDBConnection', function (event, data) {
    alert('There is no connection to a Database, please disconnect the PLC then connect to a Database and try again!');
});

ipcRenderer.on('appStatusCheck', function (event, data) {
    if (data[0] && data[1] === 1) {
        document.getElementById('appStatus').innerHTML = "Connected";
        document.getElementById('appStatus').style.color = "Green";
    } else if (!data[0] && data[1] === 1) {
        document.getElementById('appStatus').innerHTML = "Connection Failed";
        document.getElementById('appStatus').style.color = "Red";
    }

    if (data[0] === false && data[1] === 0) {
        document.getElementById('appStatus').innerHTML = "Manually Stopped";
        document.getElementById('appStatus').style.color = "Red";
    } else if (data[0] && data[1] === 0) {

    }
});

ipcRenderer.on('noDatablock', function (event, data) {
    alert('There is no Datablock, please disconnect the PLC then pick a Datablock and try again!');
});

ipcRenderer.on('insertCheck', function (event, data) {
    if (data) {
        document.getElementById('dataStatus').innerHTML = 'Sending';
        // document.getElementById('dataStatus').style.color = 'Green';
    } else {
        document.getElementById('dataStatus').innerHTML = 'Not sending';
        // document.getElementById('dataStatus').style.color = '';
    }
});

ipcRenderer.on('noTable', function (event, data) {
    alert('There is no Table in the Database, talk to the Database Admin! (aggelos100vo@gmail.com)');
});

