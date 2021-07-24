const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, dialog } = require('electron');
const knex = require('knex');
const path = require('path');
let tray = null;
let dbOK = false;
let dbData = {};
let db;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';



// Database connection renderer process handler
ipcMain.on("dbConnection", (event, data) => {
  // Call function to connect to db
  dbData = data;
  connectToDB(data, event);
});


ipcMain.on("disconnect", (event, data) => {
  // Destroy DB connection
  db.destroy();
  event.reply("conn-valid", [false, "Manually Disconnected"]);
  dbOK = false;
});


ipcMain.on("dbOK", (event, data) => {
  // Checks DB connection status
  event.reply("dbOK",[dbOK, dbData]);
});
ipcMain.on("openFile", (event, data) => {
  let dialogOptions = {
    title: 'Navigate to Datablock text file and select it',
    properties: ['openFile'],
    filters: [
      { name: 'txt', extensions: ['txt'] }
    ],
  };


  dialog.showOpenDialog(
    dialogOptions
  ).then((file) => {
    if (file.canceled === true) {
      console.log("No file selected");
    } else {
      console.log(file.filePaths);
      event.reply('sendFile', file);
      
    }

  });
});





// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}



const menuTemplate = [
  {
    label: 'Database Settings',
    click: () => {
      new Notification({ title: "Database Settings", body: "Opening Database Settings" }).show();
      createDatabaseWindow();
    }
  },
  {
    label: 'Datablock',
    click: () => {
      new Notification({ title: "Datablock", body: "Opening Datablock selection window" }).show()
      createDatablockSelWindow();
    }
  },
  {
    label: 'Charts',
    click: () => {
      new Notification({ title: "Charts", body: "Opening Charting Page" }).show()
    }
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


const createDatablockSelWindow = () => {
  const dBlockWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
    }
  });

  // const dbMenu = [
  //   {
  //     label: 'Test Menu',
  //     click: () => {
  //       new Notification({ title: "Test", body: "Test" }).show();
  //     }
  //   },
  // ];

  
  dBlockWindow.loadFile(path.join(__dirname, '/datablock/index.html'));
  dBlockWindow.removeMenu();
  dBlockWindow.webContents.openDevTools();
  dBlockWindow.setResizable(false);

  // const customMenu1 = Menu.buildFromTemplate(dbMenu);
  // Menu.setApplicationMenu(customMenu1);
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







// Database connection
function connectToDB(data, event) {
  db = knex({
    client: 'pg',
    connection: {
      host: data.host,
      user: data.user,
      password: data.pass,
      database: data.db,
    },
  });

  db.raw('select 1+1 as result').then(function () {
    // Here if the connection is valid
    event.reply("conn-valid", [true]);
    dbOK = true;
  }).catch(err => {
    // Here if an error occured during connection
    // console.log(err);
    event.reply("conn-valid", [false, err]);
    dbOK = false;
  });
  return;
}








  // db
  //   .select('*')
  //   .from("TestTable")
  //   .then(function (users) {
  //     console.log(users);
  //   })
  //   .catch(err => console.log(err.stack, "Here"));