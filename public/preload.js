// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

process.once("loaded", () => {
  contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
      // Whitelist channels
      let validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain', 'sendBarcodeToReact']; // Add 'sendBarcodeToReact' to the valid channels
      if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain', 'barcodeScanner']; // Add 'barcodeScanner' to the valid channels
      if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    getBarcodeScannerStatus: () => ipcRenderer.invoke('getBarcodeScannerStatus'),
    receive: (channel, func) => {
      let validChannels = ['fromMain', 'sqlapi']; // Add 'sqlapi' to the valid channels
      if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    getSQLAPIStatus: () => ipcRenderer.invoke('getSQLAPIStatus')
  });

  console.log('Loaded in preload.js');
});