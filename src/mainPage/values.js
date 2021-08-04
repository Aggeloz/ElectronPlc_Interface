const os = require('os');
const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());



let block = storage.getSync('parsedDatablock');
let list = document.getElementById('listValues');
document.getElementById('dbName').innerHTML = block.name;


for(let values in block.block) {
    let entry = document.createElement('li');
    entry.appendChild(document.createTextNode(values));
    list.appendChild(entry);
}