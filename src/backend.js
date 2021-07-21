const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('path');
let tray = null;




// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}



const menuTemplate = [
  {
    label: 'Database Settings',
    submenu: [
      {
        label: 'Open Database settings window',
        click: () => {
          new Notification({ title: "Database Settings", body: "Opening Database Settings" }).show();
          createDatabaseWindow();
        }
      }
    ]
  },
  {
    label: 'Charts',
    submenu: [
      {
        label: 'Open chart window',
        click: () => {
          new Notification({ title: "Charts", body: "Opening Charting Page" }).show()
        }
      }
    ]
  },
];





const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  
  mainWindow.loadFile(path.join(__dirname, '/mainPage/index.html'));
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
  mainWindow.setResizable(false);
};
const createDatabaseWindow = () => {
  const databaseWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  
  databaseWindow.loadFile(path.join(__dirname, '/database/index.html'));
  databaseWindow.removeMenu();
  databaseWindow.webContents.openDevTools();
  databaseWindow.setResizable(false);
};






app.on('ready', () => {
  createMainWindow();


  const customMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(customMenu);

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});





app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

try {
  require('electron-reloader')(module);
} catch { }



// const createWindow = () => {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//   });

//   mainWindow.loadFile(path.join(__dirname, 'index.html'));

//   mainWindow.webContents.openDevTools();
// };