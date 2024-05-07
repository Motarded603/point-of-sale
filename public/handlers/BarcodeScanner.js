/*
    This is the Barcode Scanner Connector.

    This utilizes serialport to open a com stream with certain settings
    pertaining to the need. Then it does processing to make the output
    human-readable text, and returned to the caller.

    Eventually would like to make a 'settings' menu on the main pos
    terminal window, where some of these settings can be adjusted as
    needed. For the meantime, these are manually set.
*/

const { SerialPort } = require('serialport');
const { EventEmitter } = require('events');

let barcodeData = '';

const eventEmitter = new EventEmitter();

function initiateBarcodeScanner() {
    // Check to make sure config.json exists in parent folder before proceeding
    try {
        const config = require('../config.json');
        if (config.barcodeCOM) {
            try {
                // Create Serial Port connection 
                const port = new SerialPort(config.barcodeCOM);
                console.log('BarcodeScanner.js: Barcode Scanner Initiated');
                eventEmitter.emit('barcodeScanner', 'good');
            
                // Add appropriate error handling for port and database
                port.on('error', (err) => {
                    console.error('Serial port error:', err);
                });
            
                // Switches the port into "flowing mode"
                port.on('data', async function (data) {
                    // Trim any whitespace
                    const trimmedData = data.toString().trim();
                    barcodeData += trimmedData;
            
                    if (barcodeData.length >= 12) {
                        // Take the first 12 digits
                        const barcode = barcodeData.substring(0, 12);
                        console.log('Barcode from BarcodeScanner.js:',barcode);
            
                        // Emit event to process
                        eventEmitter.emit('barcode-Scanned', barcode);
            
                        // Clear scanned barcode data cache
                        barcodeData = barcodeData.substring(12);
                    }
                });
            } catch (err) {
                eventEmitter.emit('barcodeScanner', 'failed');
                console.error('BarcodeScanner.js Error: initializing barcode scanner:', err);
            }
        } else {
            eventEmitter.emit('barcodeScanner', 'failed');
            console.error('BarcodeScanner.js Error: barcodeCOM is not defined in config.json!');
        }
    } catch (err) {
        eventEmitter.emit('barcodeScanner', 'failed');
        console.error('BarcodeScanner.js Error: loading config.json:', err);
        console.error('BarcodeScanner.js Error: Make sure config.json exists and is valid JSON.');
    }
}

module.exports.initiateBarcodeScanner = initiateBarcodeScanner;
module.exports.eventEmitter = eventEmitter;