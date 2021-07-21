const nodes7 = require('nodes7');
const plc = new nodes7;
const { find, update, insert } = require('../mongoActions');
const { initFind, dbVars, giveVars } = require('../parseDatablock');
require('../parseDatablock');
// const { dbVars, initFind } = require('./parseDatablock');
let plcTest = false;
let dbTest = false;
let lockedPLC = false;
let lockedDB = false;
let plcHere = false;
let dataBaseHere = false;
let ip;
let port;
let rack;
let slot;
let checkBad = 0;
let doneReading = false;
let doneWriting = false;
let interval = null;
let initiated = false;
let connectionStatus = document.getElementById('connectionStatus');
let dataStatus = document.getElementById('dataStatus');
let dataInsertToggle = false;
let timer = 200;
checkCollections();
// Checks if the Interface config database and file collection exist
function checkCollections() {
    const base = 'InterfaceConf';
    const coll = 'Files';
    let query = [{ here: true }];
    find(base, coll, query).then(res => {
        console.log(res.length);
        console.log(res);
        if (res[0] === null) {
            console.log('We are here');
            const insertQ = [{ here: true }];
            insert(base, coll, insertQ);
        }
    });
    query = [];
    query = [{ name: "plc" }, { name: "mongodb" }, { name: "datablock" }];
    find(base, coll, query).then(res => {
        res.forEach(element => {
            if (element !== null && element.name === 'plc') {
                plcHere = true;
                type = document.getElementById('CPU');
                ip = document.getElementById('CPUIP');
                port = document.getElementById('CPUPORT');
                rack = document.getElementById('CPURACK');
                slot = document.getElementById('CPUSLOT');
                type.value = element.data.TYPE;
                ip.value = element.data.IP;
                port.value = element.data.PORT;
                rack.value = element.data.RACK;
                slot.value = element.data.SLOT;
            } else if (element !== null && element.name === 'mongodb') {
                dataBaseHere = true;
                dbNameT = document.getElementById('DBNAME');
                collectionT = document.getElementById('COLLECTIONNAME');
                dbNameT.value = element.data.DATABASENAME;
                collectionT.value = element.data.COLLECTION;
            }
            //  else if (element == null && element.name === 'datablock') {
            //     console.log('Datablock doesnt exist');
            // }
        });
    });
}
// Test connection with the plc
function testPLCConn() {
    ip = document.getElementById('CPUIP').value;
    port = document.getElementById('CPUPORT').value;
    rack = document.getElementById('CPURACK').value;
    slot = document.getElementById('CPUSLOT').value;
    let plctag = document.getElementById('plctag');
    plc.initiateConnection({ port: port, host: ip, rack: rack, slot: slot }, connected); // Initiate connection with the plc
    function connected(err) {
        if (typeof (err) !== "undefined") {
            // We have an error.  Maybe the PLC is not reachable.
            // console.log(err);
            alert(err);
            plcTest = false
            plctag.style.color = 'White';
            alert('Connection to PLC failed!');
        } else {
            plcTest = true;
            plctag.style.color = 'Green';
            alert('Connection to PLC succeded!');
            lockPLC();
        }
        console.log(plcTest);
        if (plc.isoConnectionState === 4) {
            plc.dropConnection(); // If plc is connected then drop the connection
        }
    }
}
// Test connection with MongoDB 
function testDBConn() {
    let dbName = document.getElementById('DBNAME').value;
    let collection = document.getElementById('COLLECTIONNAME').value;
    let dbtag = document.getElementById('dbtag');
    // console.log(dbName);
    // console.log(collection);
    const query = [{ here: true }]; // Check if the collection is here
    find(dbName, collection, query).then(res => {
        if (res.length === 1) {
            dbTest = true;
            dbtag.style.color = 'Green';
            alert('Connection to Database succeded!');
            lockDB();
        } else {
            dbTest = false;
            dbtag.style.color = 'White';
            alert('Connection to Database failed!');
        }
    });
}
// Locks the input arreas for PLC creds.
function lockPLC() {
    if (plcTest) {
        var type = document.getElementById('CPU');
        var ip = document.getElementById('CPUIP');
        var port = document.getElementById('CPUPORT');
        var rack = document.getElementById('CPURACK');
        var slot = document.getElementById('CPUSLOT');
        type.disabled = true;
        ip.disabled = true;
        port.disabled = true;
        rack.disabled = true;
        slot.disabled = true;
        lockedPLC = true;
        // Query and update for PLC creds
        let query = [{ $set: { data: { 'IP': ip.value, 'TYPE': type.value, 'PORT': port.value, 'RACK': rack.value, 'SLOT': slot.value } } }];
        const filter = { name: 'plc' };
        const base = 'InterfaceConf';
        const coll = 'Files';
        update(base, coll, query, filter);
    }
}
// Locks the input arreas for DB creds.
function lockDB() {
    if (dbTest) {
        var dbName = document.getElementById('DBNAME');
        var collectionName = document.getElementById('COLLECTIONNAME');
        dbName.disabled = true;
        collectionName.disabled = true;
        lockedDB = true;
        // Query and update for DB creds
        let query = [{ $set: { data: { 'URL': 'mongodb://localhost:27017/', 'DATABASENAME': dbName.value, 'COLLECTION': collectionName.value } } }];
        const filter = { name: 'mongodb' };
        const base = 'InterfaceConf';
        const coll = 'Files';
        update(base, coll, query, filter);
    }
}
// Unlocks input areas for PLC creds.
function unlockPLC() {
    if (initiated) {
        alert('Terminate the connection to change the PLC creds.');
    } else {
        var type = document.getElementById('CPU');
        var ip = document.getElementById('CPUIP');
        var port = document.getElementById('CPUPORT');
        var rack = document.getElementById('CPURACK');
        var slot = document.getElementById('CPUSLOT');
        if (type.disabled) {
            type.disabled = false;
            ip.disabled = false;
            port.disabled = false;
            rack.disabled = false;
            slot.disabled = false;
            lockedPLC = false;
        }
    }
}
// Unlocks input areas for DB creds.
function unlockDB() {
    if (initiated) {
        alert('Terminate the connection to change the Database creds.')
    } else {
        var dbName = document.getElementById('DBNAME');
        var collectionName = document.getElementById('COLLECTIONNAME');
        if (dbName.disabled) {
            dbName.disabled = false;
            collectionName.disabled = false;
            lockedDB = false;
        }
    }
}
// Initiates find func
initFind();
// Gets vars from the PLC Datablock text file
let dataBlocks = giveVars();

// for (let k in dataBlocks) {
//     console.log(k);
// }

// Starts connection between DB and PLC
function startConn() {
    if (plcTest && dbTest && lockedPLC && lockedDB) { // Checks if all the tests came true
        initiated = true; // Sets connection state to true
        plc.initiateConnection({ port: port, host: ip, rack: rack, slot: slot }, connected); // Connects to PLC
        function connected(err) {
            if (typeof (err) !== "undefined") {
                // We have an error.  Maybe the PLC is not reachable.
                // console.log(err);
                alert(err);
                connectionStatus.innerHTML = 'Error With Connection';
                connectionStatus.style.color = 'Red';
            }
            if (plc.isoConnectionState === 4) {
                connectionStatus.innerHTML = 'Connected';
                connectionStatus.style.color = 'Green';
                plc.setTranslationCB(function (tag) { return dataBlocks[tag]; }); 	// This sets the "translation" to allow us to work with object names
                for (let datablockValue in dataBlocks) {
                    // console.log(datablockValue);
                    plc.addItems(datablockValue);
                }
                interval = setInterval(() => { plc.readAllItems(checkValues); }, timer); // Interval for reading the values every 200 ms
            }
        }
    } else {
        alert('Test the connections and save the creds before finilizing!');
    }
}
// Checks for bad values
// If not then proceeds
function checkValues(anythingBad, values) {
    if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
    // console.log(values);
    afterCheck(values, anythingBad);
    doneReading = true;
    if (doneWriting) { process.exit(); }
}
// If values come bad more than 5 times an alert window with and error pops up
function afterCheck(values, anythingBad) {
    // console.log(values);
    // console.log(Object.keys(values));
    // console.log(Object.values(values));
    // console.log(anythingBad);
    if (anythingBad === true) {
        checkBad++;
        // console.log(anythingBad);
        // console.log(checkBad);
    } else {
        // If a good value comes through the bad value counter resets
        checkBad = 0;
        // console.log('All good');
        if (dataInsertToggle) {
            sendData(values);
            dataStatus.innerHTML = 'Sending';
            dataStatus.style.color = 'Green';
        }
    }
    if (checkBad >= 5) {
        // console.log('Something went wrong reading values');
        alert('Cannot read values something is wrong');
        clearInterval(interval);
        dataStatus.innerHTML = 'Error with reading values';
        dataStatus.style.color = 'Red';
    }
}

// Function for manual disconnect of { final } connection between plc and database
function stopConn() {
    if (plc.isoConnectionState === 4) {
        clearInterval(interval); // Clears interval for datablock value reading (stops the interval)
        plc.dropConnection(); // Drops plc connection
        connectionStatus.innerHTML = 'Manually Disconnected';
        connectionStatus.style.color = 'Red';
        initiated = false;
        dataStatus.innerHTML = 'Not sending';
        dataStatus.style.color = 'Red';
    }
}

function toggleDataInsert() {
    if (initiated) {
        dataInsertToggle = !dataInsertToggle;
        // console.log(dataInsertToggle);

        const base = 'InterfaceConf';
        const coll = 'Files';
        const query = [{ name: 'datablock' }];
        find(base, coll, query).then(res => {
            // console.log(res[0]);
            if (res[0] === null) {
                alert('Missing DataBlock');
            } else
                if (dataInsertToggle) {
                    dataStatus.innerHTML = 'Sending';
                    dataStatus.style.color = 'Green';
                    // initFind();
                } else {
                    dataStatus.innerHTML = 'Not sending';
                    dataStatus.style.color = 'Red';
                }
        });
    } else {
        alert('Make sure that the PLC and the Database are connected!');
    }
    // initFind(); // Recall find Datablock function from parsing Library
    // console.log(giveVars()); // Print the parsed datablock as an object
}
// Sends data to database
// Queries the collection and then just inerts data
function sendData(values) {
    // for (let i = 0; i < 8; i++) {
    //     if (values.) {

    //     }
    // }
    console.log(typeof values);
    let now = new Date();
    let date = now.toLocaleString();
    values["DATE"] = date;
    console.log(values);
    let query = [values];
    let dbName = document.getElementById('DBNAME').value;
    let collection = document.getElementById('COLLECTIONNAME').value;
    insert(dbName, collection, query);
}