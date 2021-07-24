const { ipcRenderer,dialog } = require('electron');



async function openDbSel() {
    let dialogOptions = {
        title: 'Navigate to Datablock text file and select it',
        properties: ['openFile'],
        filters: [
            { name: 'txt', extensions: [txt] }
        ],
    };


    let lookWindow = await dialog.showOpenDialog(dialogOptions);
    console.log(lookWindow);
    
}