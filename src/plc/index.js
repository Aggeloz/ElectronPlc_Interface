const { ipcRenderer } = require('electron');
var nodes7 = require('nodes7'); // This is the package name, if the repository is cloned you may need to require 'nodeS7' with uppercase S
var plc = new nodes7;
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());


let ip;
let port;
let rack;
let slot;
let checkBad = 0;
let doneReading = false;
let doneWriting = false;
let interval = null;
let initiated = false;


function connectPLC() {
    console.log('init connection');
    ip = document.getElementById('CPUIP').value;
    port = document.getElementById('CPUPORT').value;
    rack = document.getElementById('CPURACK').value;
    slot = document.getElementById('CPUSLOT').value;

    plc.initiateConnection({ port: port, host: ip, rack: rack, slot: slot }, connected); // Initiate connection with the plc
    function connected(err) {
        if(typeof (err) !== 'undefined') {
            // We have an error. Maybe the PLC is not reachable
            console.log(err);
            plcTest = false;
            // alert('Connection to PLC Failed!', err);
        } else {
            plcTest = true;
            // alert('Connection to PLC Succeded!');
        }
        if (plc.isoConnectionState === 4) {
            // plc.dropConnection();
        }
    }
}