/*
    This is the SQL Query API, which uses Express as its backend. It uses
    MariaDB to connect to the MariaDB database, in order to query for
    product information as well as transaction history. This may also
    eventually handle certain settings if I find a need.
 */
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const config = require('../config.json');

const app = express();
const port = 5000;

// Create a pool of connections to the database
const pool = mariadb.createPool(config.database);

// Middleware to parse incoming request bodies
app.use(cors());

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
        console.error('Error querying database:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app; // Export the app instance
    