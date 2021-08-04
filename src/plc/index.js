const { ipcRenderer } = require('electron');
// var nodes7 = require('nodes7'); // This is the package name, if the repository is cloned you may need to require 'nodeS7' with uppercase S
// var plc = new nodes7;
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());

function connectPLC() {
    ip = document.getElementById('CPUIP').value;
    port = document.getElementById('CPUPORT').value;
    rack = document.getElementById('CPURACK').value;
    slot = document.getElementById('CPUSLOT').value;

    ipcRenderer.send('connectPLC', { port: port, host: ip, rack: rack, slot: slot });
}





function disconnectPLC() {
    ipcRenderer.send('disconnectPLC');
    document.getElementById('plcStatus').innerHTML = 'Manually Disconnected';
    document.getElementById('plcStatus').style.color = 'Red';
}


loadPLC();
function loadPLC() {
    storage.has('plcStats', function (err, hasPlcStats) {
        if (err) throw err;
        if(hasPlcStats) {
            let plc = storage.getSync('plcStats')
            console.log(plc.plc);
            document.getElementById('CPUIP').value = plc.plc.host;
            document.getElementById('CPUPORT').value = plc.plc.port;
            document.getElementById('CPURACK').value = plc.plc.rack;
            document.getElementById('CPUSLOT').value = plc.plc.slot;
        }
    })
    ipcRenderer.send('checkPLC');
}


ipcRenderer.on('plcCheck', function(event, data) {
    console.log(data);
    if (data) {
        document.getElementById('plcStatus').innerHTML = 'Connected';
        document.getElementById('plcStatus').style.color = 'Green';
    } else {
        document.getElementById('plcStatus').innerHTML = 'Not Connected';
        document.getElementById('plcStatus').style.color = 'Red';
    }
});

ipcRenderer.on('plc-valid', function(event, data) {
    // console.log(data);
    if(data) {
        alert('PLC Connected!');
        document.getElementById('plcStatus').innerHTML = 'Connected';
        document.getElementById('plcStatus').style.color = 'Green';
    } else {
        alert('PLC Didn\'t connect!');
        document.getElementById('plcStatus').innerHTML = 'Not Connected';
        document.getElementById('plcStatus').style.color = 'Red';
    }
})