const { ipcRenderer } = require('electron');

async function openDbSel() {
    ipcRenderer.send('openFile');
}
