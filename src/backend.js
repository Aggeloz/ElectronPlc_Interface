const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('path');
let tray = null;


ipcMain.on("dbConnection", (event, data)=> {
  // TODO: 
  // User Data to connect to PG DB
  // If statement to alert user if 
  // connection was successful or not
  // Alert user if connection fail
  // Lock inputs if succeded
  // Also use some of the values for main window


});

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






// ---------------------------------
// Connect to database using Knex
const knex = require('knex');


// const db = knex({
//     client: 'pg',
//     connection: {
//         host: '192.168.1.120',
//         user: 'Aggelos',
//         password: 'aggel0s100v0',
//         database: 'TestDB',
//     },
// });


// db
//     .select('*')
//     .from("TestTable")
//     .then(function (users) {
//         console.log(users);
//         // [ { id: 1, description: 'Burrito', ... } ]
//     })
//     .catch(err => console.log(err.stack));

function connect() {
  let host = document.getElementById('host').value;
  let user = document.getElementById('user').value;
  let password = document.getElementById('password').value;
  let dataBase = document.getElementById('database').value;





  const db = knex({
    client: 'pg',
    connection: {
      host: host,
      user: user,
      password: password,
      database: dataBase,
    },
  });
  db
    .select('*')
    .from("TestTable")
    .then(function (users) {
      console.log(users);
      // [ { id: 1, description: 'Burrito', ... } ]
    })
    .catch(err => console.log(err.stack));

}