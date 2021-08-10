const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, dialog, globalShortcut, Debugger } = require('electron');
const os = require('os');
const { giveFileGetBlock } = require('./parseDatablock/parser');
const storage = require('electron-json-storage');
const knex = require('knex');
const path = require('path');
require('./date.format');
// const { connectPLC, disconnectPLC, plcConnected } = require('./plcConnection');
var nodes7 = require('nodes7');
var plc = new nodes7;
let tray = null;
let dbData = {};
let db;

let dbOK = false;
let datablockOK = false;
let plcOK = false;
let toggleInsert = false;
let appConnection = false;

let doneReading = false;
let doneWriting = false;
let timer = 1000;
let stopReading = false;

// app.commandLine.appendSwitch('inspect', '5858');
app.commandLine.appendSwitch('remote-debugging-port', '5858')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')


storage.setDataPath(os.tmpdir());
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


// Database connection renderer process handler
ipcMain.on("connectPLC", async (event, data) => {
  connectPLC(data, event);
});

// Database connection renderer process handler
ipcMain.on("checkAppStatus", async (event, data) => {
  if(data === 1) {
    event.reply('appStatusCheck', [appConnection, 1]);
  } else {
    event.reply('appStatusCheck', [appConnection, 0]);
  }
});




// Toggle DB insert
ipcMain.on("toggleInsert", async (event, data) => {
  toggleInsert = !toggleInsert;
});
// Check DB insert state
ipcMain.on("checkInsert", async (event, data) => {
  event.reply('insertCheck', toggleInsert);
});



// Delete datablock local storage
ipcMain.on("deleteBlock", async (event, data) => {
  storage.remove('parsedDatablock', function (err) {
    if (err) throw err;
  })
});


ipcMain.on("initPLC", async (event, data) => {
  // initPLC(event);
  checkForTable(event);
});

ipcMain.on("stopPLC", async (event, data) => {
  stopReadingPLC();
  appConnection = false;
});


// Create window to show all values from the Datablock
ipcMain.on("showDBValues", async (event, data) => {
  // connectPLC(data);
  console.log(storage.getSync('parsedDatablock').block);
  createValuesWindow();
});


// Handle PLC Disconnection
ipcMain.on("disconnectPLC", (event, data) => {
  disconnectPLC();
});

// Handle PLC checking in main window
ipcMain.on("checkPLC", (event, data) => {
  event.reply('plcCheck', plcOK);
});




// Handle Database checking in main window
ipcMain.handle('checkDB', (event, data) => {
  return dbOK;
});

ipcMain.on("checkDBOK", (event, data) => {
  event.reply("isDBOk", dbOK);
});

ipcMain.on("dbOK", (event, data) => {
  // Checks DB connection status
  event.reply("dbOK", [dbOK, dbData]);
});




// Database connection renderer process handler
ipcMain.on("dbConnection", (event, data) => {
  // Call function to connect to db
  dbData = data;
  connectToDB(data, event);
});

// Handle Database disconnection
ipcMain.on("disconnect", (event, data) => {
  // Destroy DB connection
  db.destroy();
  event.reply("conn-valid", [false, "Manually Disconnected"]);
  dbOK = false;
});




// Open datablock file 
ipcMain.on("openFile", (event, data) => {
  let dialogOptions = {
    title: 'Navigate to Datablock text file and select it',
    properties: ['openFile'],
    filters: [
      { name: 'txt', extensions: ['txt', 'TXT'] },
    ],
  };

  // Get Datablock file
  dialog.showOpenDialog(
    dialogOptions
  ).then((file) => {
    if (file.canceled === true) {
      console.log("No file selected");
    } else {
      console.log(file.filePaths);
      let all = giveFileGetBlock(file.filePaths[0]);
      // Save Parsed datablock in local file with json-storage
      console.log(typeof (all));
      storage.set('parsedDatablock', { block: all, name: file.filePaths[0] }, function (err) {
        if (err) {
          throw err;
        }
      })
      event.reply('datablock', { block: all, name: file.filePaths[0] });
    }
  });
});


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}



const menuTemplate = [
  {
    label: 'PLC Settings',
    click: () => {
      new Notification({ title: "PLC Settings", body: "Opening PLC Settings" }).show();
      createPlcWindow();
    }
  },
  {
    label: 'Database Settings',
    click: () => {
      new Notification({ title: "Database Settings", body: "Opening Database Settings" }).show();
      createDatabaseWindow();
    }
  },
  {
    label: 'Datablock',
    enabled: false,
    click: () => {
      new Notification({ title: "Datablock", body: "Opening Datablock selection window" }).show();
      createDatablockSelWindow();
    },
    id: 'datablockMenu'
  },
  // {
  //   label: 'Charts',
  //   click: () => {
  //     new Notification({ title: "Charts", body: "Opening Charting Page" }).show();
  //     createChartWindow();
  //   }
  // },
  {
    label: 'Console',
    click: () => {
      // createConsole();
    }
  },
];





const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1050,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    }
  });


  mainWindow.loadFile(path.join(__dirname, '/mainPage/index.html'));
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
  mainWindow.setResizable(false);
};


const createValuesWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    }
  });


  mainWindow.loadFile(path.join(__dirname, '/mainPage/values.html'));
  mainWindow.removeMenu();
  mainWindow.webContents.openDevTools();
  mainWindow.setResizable(false);
};



const createConsole = () => {
  const mainWindow = new BrowserWindow({
    width: 1900,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    }
  });


  mainWindow.loadURL('chrome://inspect/#devices')
  // mainWindow.open('brave://inspect/#devices');
  mainWindow.removeMenu();
  // mainWindow.webContents.openDevTools();
  mainWindow.setResizable(false);
};



const createChartWindow = () => {
  const chartWindow = new BrowserWindow({
    width: 1900,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
    }
  });

  chartWindow.loadFile(path.join(__dirname, '/charts/index.html'));
  chartWindow.removeMenu();
  // mainWindow.webContents.openDevTools();
  chartWindow.setResizable(false);
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
  // databaseWindow.webContents.openDevTools();
  databaseWindow.setResizable(false);
};


const createPlcWindow = () => {
  const plcWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  plcWindow.loadFile(path.join(__dirname, '/plc/index.html'));
  plcWindow.removeMenu();
  plcWindow.webContents.openDevTools();
  plcWindow.setResizable(false);
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
  // dBlockWindow.webContents.openDevTools();
  dBlockWindow.setResizable(false);

  // const customMenu1 = Menu.buildFromTemplate(dbMenu);
  // Menu.setApplicationMenu(customMenu1);
};






app.on('ready', () => {
  createMainWindow();


  const customMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(customMenu);

  // globalShortcut.register('Control+Shift+I', () => {
  //   createMainWindow.webContents.openDevTools()
  //   return true;
  // });

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

  storage.has('databaseStats', function (error, hasDatabaseStatsKey) {
    if (error) throw error;

    if (hasDatabaseStatsKey) {

      storage.set('databaseStats', {
        host: data.host,
        user: data.user,
        database: data.db,
      }, function (error) {
        if (error) throw error;
      });

    } else {
      console.log('There are no Database Stats');
      storage.set('databaseStats', {
        host: data.host,
        user: data.user,
        database: data.db,
      }, function (error) {
        if (error) throw error;
      });
    }
  });

  console.log(typeof ({
    host: data.host,
    user: data.user,
    password: data.pass,
    database: data.db,
  }));

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




let dataBlocks;
// --------------PLC CONNECTION----------------

function connectPLC(data, event) {
  storage.set('plcStats', { plc: data }, function (err) {
    if (err) throw err;
  });
  plc.initiateConnection(data, connected); // Initiate connection with the plc
  function connected(err) {
    if (typeof (err) !== 'undefined') {
      // We have an error. Maybe the PLC is not reachable
      console.log(err);
      plcOK = false;
      // alert('Connection to PLC Failed!', err);
    }
    if (plc.isoConnectionState === 4) {
      plcOK = true;
      console.log('Plc Connected', plcOK);


      event.reply('plc-valid', true);
    } else {
      event.reply('plc-valid', false);
      plcOK = false;
    }
  }
}

function disconnectPLC() {
  plc.dropConnection();
  plcOK = false;
  console.log('Plc Disconnected', !plcOK);
}




let testTimer = 0;



function initPLC(event) {
  storage.has('parsedDatablock', function (error, hasParsedBlock) {
    if (error) throw error;
    if (hasParsedBlock) {
      dataBlocks = storage.getSync('parsedDatablock');
      // console.log(dataBlocks);
      plc.setTranslationCB(function (tag) { return dataBlocks.block[tag]; });
      console.log(dataBlocks);
      for (let datablockValue in dataBlocks.block) {
        console.log(datablockValue);
        // console.log(datablockValue.toString());
        plc.addItems(datablockValue);
        // plc.addItems(datablockValue.toString());
        // readLoop();
      }
      appConnection = true;
      setTimeout(readLoop, 500);
      let oof = 0;
      // setInterval(() => {console.log("Seconds", oof++);}, 1000);
    } else {
      console.log('No parsed Datablock');
      event.reply('noDatablock')
    }
  });
}


let nextTimer = 1000;
let offTimer = 0;


function readLoop() {
  offTimer = setTimeout(() => {

    plc.readAllItems((badValue, values) => {
      if (badValue) {
        console.log('SOMETHING WENT WRONG READING A VALUE');
      }
      // console.log(values);
      console.log('Main valve is', values.Valve);
      console.log('Timer', nextTimer);
      if (values.Valve === true) {
        nextTimer = 200
        sendDatatoDB(values);
      } else {
        nextTimer = 1000
      }

    })

    readLoop();  // set up the next tick
  }, nextTimer);
}



function stopReadingPLC() {
  clearInterval(offTimer);
  offTimer = 0;
  console.log('Stoped reading!');
}



function checkForTable(event) {
  try {
    db.schema.hasTable('values').then(function (exists) {
      if (!exists) {
        // return knex.schema.createTable('users', function (t) {
        //   t.increments('id').primary();
        //   t.string('first_name', 100);
        //   t.string('last_name', 100);
        //   t.text('bio');
        // });
        event.reply('noTable')
        console.log('The Table is missing!');

      } else {
        console.log('Table is here!');
        initPLC(event);
      }
    });
  } catch (err) {
    console.log('Error Here:', err);
    event.reply('noDBConnection');
  }
}


function sendDatatoDB(values) {
  if (toggleInsert) {
    let now = new Date();
    // console.log(values);
    db('values').insert(
      {
        VALVE1: values.Valve1,
        VALVE2: values.Valve2,
        VALVE3: values.Valve3,
        VALVE4: values.Valve4,
        VALVE5: values.Valve5,
        VALVE6: values.Valve6,
        VALVE7: values.Valve7,
        VALVE8: values.Valve8,
        VALVE: values.Valve,
        PH: values.PH,
        PH1: values.PH1,
        PH2: values.PH2,
        PHV1: values.PHV1,
        PHV2: values.PHV2,
        PHV3: values.PHV3,
        PHV4: values.PHV4,
        PHV5: values.PHV5,
        PHV6: values.PHV6,
        PHV7: values.PHV7,
        PHV8: values.PHV8,
        EC: values.EC,
        EC1: values.EC1,
        EC2: values.EC2,
        ECV1: values.ECV1,
        ECV2: values.ECV2,
        ECV3: values.ECV3,
        ECV4: values.ECV4,
        ECV5: values.ECV5,
        ECV6: values.ECV6,
        ECV7: values.ECV7,
        ECV8: values.ECV8,
        FRESHWATERQ: values.FRESHWATERQ,
        TFRQ: values.TFRQ,
        IRIGATIONQ: values.IRIGATIONQ,
        SUNPOWER: values.SUNPOWER,
        SUNENERGY: values.SUNENERGY,
        SUNENERGYG1: values.SUNENERGYG1,
        SUNENERGYG2: values.SUNENERGYG2,
        DATE: now.format("dd/MM/yyyy HH:mm:ss l"),
      }
    ).then(() => console.log('Inserted'))
    .catch((err) => { console.log(err); throw err; });
  }
}






