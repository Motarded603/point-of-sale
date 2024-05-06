/*
    This Electron application controls the lifecycle and window creation.
    It integrates with a React application built using Create React App.
    The application utilizes a local proxy to adjust file paths for local
    production bundles.

    When Electron is ready, it creates a native browser window and loads
    the React application. In development mode, it opens Chrome DevTools
    automatically.

    The application registers an HTTP protocol to normalize file paths for
    local files. It sets up IPC communication to listen for messages from
    the renderer process. It also initiates a barcode scanner and listens
    for barcode scanned events, then sends the barcode data to the renderer
    process.

    The application handles window activation on macOS and quits when all
    windows are closed, except on macOS where it stays active until
    explicitly quit.

    Navigation is limited to known destinations to improve security.
*/

// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const expressApp = require('./handlers/SQLQueryAPI');
const BarcodeScanner = require('./handlers/BarcodeScanner');

let mainWindow;

// Create the native browser window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 672,
        height: 600,
        // Set the path of an additional "preload" script that can be used to
        // communicate between node-land and brownser-land.
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Remove Menu Items at the top of the window ( File | Edit | View )
    mainWindow.removeMenu();

    /* 
        In production, set the initial browser path to the local bundle
        generated by the Create React App build process. In development,
        set it to localhost to allow live/hot-reloading.
    */
    const appURL = app.isPackaged
        ? url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
        : "http://localhost:3000";
    mainWindow.loadURL(appURL);

    // Automatically open Chrome's DevTools in development mode.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
    protocol.registerHttpProtocol(
        "file",
        (request, callback) => {
            const url = request.url.substr(8);
            callback({ path: path.normalize(`${__dirname}/${url}`) });
        },
        (error) => {
            if (error) console.error("Failed to register protocol");
        },
    );
}

// Initiate Barcode Scanner
BarcodeScanner.initiateBarcodeScanner();
console.log('Initated Barcode Scanner');

// Listen for the 'barcodeScanned' event from BarcodeScanner.js
BarcodeScanner.eventEmitter.on('barcode-Scanned', (barcode) => {
    console.log('Received Barcode in electron.js:', barcode);
    mainWindow.webContents.send('sendBarcodeToReact', barcode);
    console.log('sendBarcodeToReact,', barcode);
});

/*
    This method will be called when Electron has finished its initialization
    and is ready to create the browser windows. Some APIs can only be used
    after this event occurs.
*/
app.whenReady().then(() => {
    console.log('When ready!!')
    createWindow();
    setupLocalFilesNormalizerProxy();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit nagivation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = ["http://point-of-sale.com", "https://youtube.com", "https://reactjs.org"];
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
            event.preventDefault();
        }
    });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.