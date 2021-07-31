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