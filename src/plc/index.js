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
}