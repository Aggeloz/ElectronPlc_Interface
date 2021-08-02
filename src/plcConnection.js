var nodes7 = require('nodes7'); // This is the package name, if the repository is cloned you may need to require 'nodeS7' with uppercase S
var plc = new nodes7;
let doneReading = false;
let doneWriting = false;
let plcConnected = false;



async function connectPLC(data) {
    plc.initiateConnection(data, connected); // Initiate connection with the plc
    function connected(err) {
        if (typeof (err) !== 'undefined') {
            // We have an error. Maybe the PLC is not reachable
            console.log(err);
            plcConnected = false;
            // alert('Connection to PLC Failed!', err);
        }
        if (plc.isoConnectionState === 4) {
            plcConnected = true;
            console.log('In plcConnection', plcConnected);
        } else {
            console.log('In plcConnection', plcConnected);
            plcConnected = false;
        }
    }
}



function disconnectPLC() {
    plc.dropConnection();
    plcConnected = false;
}

