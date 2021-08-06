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
}
function stopPLC() {
    ipcRenderer.send('stopPLC');
}

ipcRenderer.on('noDBConnection', function (event, data) {
    alert('There is no connection to a Database, please disconnect the PLC then connect to a Database and try again!');
});

ipcRenderer.on('noDatablock', function (event, data) {
    alert('There is no Datablock, please disconnect the PLC then pick a Datablock and try again!');
});

ipcRenderer.on('noTable', function (event, data) {
    alert('There is no Table in the Database, talk to the Database Admin! (aggelos100vo@gmail.com)');
});

