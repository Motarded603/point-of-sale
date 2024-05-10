/*
    This is the SQL Query API, which uses Express as its backend. It uses
    MariaDB to connect to the MariaDB database, in order to query for
    product information as well as transaction history. This may also
    eventually handle certain settings if I find a need.
 */
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const { EventEmitter } = require('events');

const app = express();
const port = 5000;

const eventEmitter = new EventEmitter();

let status = '';

function initiateSQLAPI() {
    // Check to make sure config.json exists in parent folder before proceeding
    try {
        const config = require('../config.json');

        /*
            MariaDB SQL Pool
            Check to make sure 'database' exists in 'config.json' and then create
            a pool of connections to the database.
        */
        let pool;

        if (config.database) {
            try {
                pool = mariadb.createPool(config.database);

                // Middleware to parse incoming request bodies
                app.use(cors());

                /*
                    API to handle getProduct
                    Expects:
                        barcode=[insert-barcode]
                    Returns:
                        - {itemBarcode}, {itemName}, Price: ${itemPrice}
                        - 404: Item not found
                */
                app.get('/api/getProduct', async (req, res) => {
                    const barcode = req.query.barcode;
                    //console.log(barcode);

                    try {
                        // Use the pool to get a connection and query the database
                        const conn = await pool.getConnection();
                        const rows = await conn.query('SELECT * FROM product_info WHERE itemBarcode = ?', [barcode]);

                        //res.send({rows});
                        // Check result to make sure it contains data, then send data as response
                        if (rows.length > 0) {
                            const { itemBarcode, itemName, itemPrice } = rows[0];
                            console.log('/api/getProduct result:', `${itemBarcode}, ${itemName}, Price: ${itemPrice}`);
                            res.send({ itemName, itemPrice });
                        } else {
                            console.log('/api/getProduct result:', `Item not found: ${barcode}`);
                            res.status(404).send('Item not found');
                        }

                        // Release the connection back to the pool
                        conn.release();
                    } catch (err) {
                        console.error('SQLQueryAPI.js Error: querying database:', err);
                        res.status(500).send('Internal Server Error');
                    }
                });

                // Start the server
                app.listen(port, () => {
                    console.log(`SQLQueryAPI.js: Server running at http://localhost:${port}`);
                    setStatus('good');
                });
            } catch (err) {
                setStatus('failed');
                console.error('SQLQueryAPI.js Error: creating database pool:', err);
            }
        } else {
            setStatus('failed');
            console.error('SQLQueryAPI.js Error: database is not defined in config.json!');
        }
    } catch (err) {
        setStatus('failed');
        console.error('SQLQueryAPI.js Error: loading config.json:', err);
        console.error('SQLQueryAPI.js Error: Make sure config.json exists and is valid JSON.');
    }

    //module.exports = app;
}

function setStatus(newStatus) {
    eventEmitter.emit('sqlapi', newStatus);
    status = newStatus;
}

function getStatus() {
    return status;
}

module.exports.initiateSQLAPI = initiateSQLAPI;
module.exports.eventEmitter = eventEmitter;
module.exports.getStatus = getStatus;