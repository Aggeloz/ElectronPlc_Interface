const { ipcRenderer } = require('electron');
const { giveFileGetBlock } = require('../parseDatablock/parser');

ipcRenderer.on('sendFile', (event, data) => {
    console.log(data);
    giveFileGetBlock(data.filePaths[0]);
});

async function openDbSel() {
    ipcRenderer.send('openFile');
}