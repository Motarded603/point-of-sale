/*
    The start of a Point of Sale implementation.

    This will be very bare-bones. Let me set the tone for this project...
    I acquired two point of sale terminals, along with barcode scanners,
    receipt printers, credit card readers (built into terminal as well as
    external). I have a 4-year-old niece who is currently obsessed with
    'play-store' and already has an old-school cash register. Me unsure
    what to even do with a POS setup, figured let's get better with
    programming and make a simple POS system that implements an SQL server
    (MariaDB), the barcode scanner, receipt printer, and utilize the touch
    screen capabilities of the POS terminal. 

    The end-goal is that when a product (for example, bag of Doritos) is
    scanned via the barcode scanner, read the UPC code and cross-check
    the SQL server to see if the barcode exists in the system. If it does
    exist, get the barcode data. Current SQL table product_info schema:
      (itemID VARCHAR(16), itemName VARCHAR(64), itemPrice DECIMAL(8, 2))
    Then, when it gets this data, put it into a list, scannedItems. Since
    this is a POS system, there will be duplicates of scanned items. This
    means we need to keep track of a quantity of how many times an item
    has been scanned. We do not want to display multiple lines of the same
    item, as this will be more difficult to keep track of if a customer
    is purchasing multiple of the same product. We would also like the
    ability to delete an item, for example if a product was scanned three
    times, but customer is only purchasing two of that item. We need the
    ability to select one of the items (or multiple), and hit 'delete'
    to subtract one quantity from the amount (if only one item is scanned,
    remove the item from the list of course).

    As of right now, I am not worried about implementing the barcode scanner
    and SQL server (I do have working test-code that I know it's possible,
    but still need to convert it to work with reactjs). As can be seen below,
    I am manually passing 
    
*/

import './App.css';
import { DisplayCurrentTransaction, DisplayTotal } from './handlers/DisplayCurrentTransaction';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  console.log('App component rendered!');
  const [scannedProducts, setScannedProducts] = useState([]);
  console.log('scannedProducts from App:', scannedProducts)

  // Add a useEffect hook to listen for the 'barcodeScanned' event from electron
  useEffect(() => {
    window.electron.receive('sendBarcodeToReact', async (barcode) => {
      console.log('Received Barcode in App.js:', barcode);
      console.log('Scanned Products from App.js:', scannedProducts);
      // Handle the received barcode data here, such as updating the scannedProducts state
      fetch(`http://localhost:5000/api/getProduct?barcode=${barcode}`)
      .then(response => {
        if (!response.ok) {
          console.log('Product not found!');
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          // Handle the API response data
          console.log('Got Product Data from API:', data);
          // Check if the product already exists in scannedProducts
          const existingProductIndex = scannedProducts.findIndex(p => p.barcode === barcode);
          if (existingProductIndex !== -1) {
              // Product already exists, update quantity
              setScannedProducts(prevProducts => {
                  const updatedProducts = [...prevProducts];
                  updatedProducts[existingProductIndex].quantity += 1;
                  return updatedProducts;
              });
          } else {
              // Product is new, add to the list
              setScannedProducts(prevProducts => [...prevProducts, {
                  id: uuidv4(), // Generate a UUID for the unique key, to distinguish items
                  barcode: barcode,
                  name: data.itemName,
                  price: parseFloat(data.itemPrice), // Convert to number
                  quantity: 1 // Set initial quantity to 1
              }]);
              console.log('Product hasn\'t been scanned yet. Adding to new Item. Here is scannedProducts:', scannedProducts);
          }
        }
      })
      .catch(error => {
          console.error('Error:', error);
      });
    });
  }, []);

  window.electron.getSQLAPIStatus().then(status => {
    if (status === 'failed') {
      console.log('App.js Error: Acknowledges - SQLQueryAPI.status:', status);
    } else if (status === 'good') {
      console.log('App.js: Acknowledges - SQLQueryAPI.status:', status);
    }
  });

  window.electron.getBarcodeScannerStatus().then(status => {
    if (status === 'failed') {
      console.log('App.js Error: Acknowledges - BarcodeScanner.status:', status);
    } else if (status === 'good') {
      console.log('App.js: Acknowledges - BarcodeScanner.status:', status);
    }
  });

  return (
    // Default HTML file produced by React.
    <div className="App">
      <DisplayCurrentTransaction
        scannedProducts={scannedProducts}
        setScannedProducts={setScannedProducts}
      />
      <DisplayTotal
        subtotal={calculateSubtotal(scannedProducts)}
        scannedProducts={scannedProducts}
        setScannedProducts={setScannedProducts}
      />
    </div>
  );
}

function calculateSubtotal(scannedProducts) {
  return scannedProducts.reduce((acc, product) => acc + product.price * product.quantity, 0);
}