import React, { useState } from 'react';
/*
    This is what handles and processes transactions.
*/

function DisplayProduct({ barcode, name, price, quantity, clicked, setScannedProducts }) {
    const [hover, setHover] = useState(false);

    const handleClick = () => {
        console.log("Product clicked!");
        setScannedProducts(prevProducts =>
            prevProducts.map(product =>
                product.barcode === barcode ? {...product, clicked: !product.clicked } : product
            )
        );
    };
  
    return (
      <div
        className="Product"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseDown={handleClick}
        style={{ backgroundColor: (hover || clicked) ? "#aac0ce" : "" }}
      >
        <table>
            <tbody>
                <tr>
                    <td className="Product-barcode">{barcode}</td>
                    <td className="Product-name">{name}</td>
                    <td className="Product-price">{price.toFixed(2)}</td>
                    <td className="Product-quantity">{quantity}</td>
                </tr>
            </tbody>
        </table>
      </div>
    );
}

export function DisplayTotal({ subtotal, scannedProducts, setScannedProducts }) {
    const tax = subtotal * 0.085;
    const total = subtotal + tax;

    const removeAllClickedItems = () => {
        console.log("Before removal:", scannedProducts);
        const updatedProducts = scannedProducts.filter(product => !product.clicked);
        console.log("After removal:", updatedProducts);
        setScannedProducts(updatedProducts);
    };

    return (
        <div className="TransactionTotal">
            <table className="TransactionTotal-Table">
                <tbody>
                    <tr>
                        <td className="TransactionTotal-Header">Subtotal:</td>
                        <td className="TransactionTotal-Cost">$ {subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="TransactionTotal-Header">Tax:</td>
                        <td className="TransactionTotal-Cost">$ {tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="TransactionTotal-Header">Total:</td>
                        <td className="TransactionTotal-Cost">$ {total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <button className="Transaction-DeleteItem" onClick={removeAllClickedItems}>Delete</button>
        </div>
    )
}

export function DisplayCurrentTransaction({ scannedProducts, setScannedProducts }) {

    console.log("Scanned products:", scannedProducts);

    return (
        <div className="ScannedProducts">
        {scannedProducts.map((scannedProduct) => {
            return (
                <DisplayProduct
                    key={scannedProduct.id}
                    barcode={scannedProduct.barcode}
                    name={scannedProduct.name}
                    price={scannedProduct.price}
                    quantity={scannedProduct.quantity}
                    clicked={scannedProduct.clicked}
                    setScannedProducts={setScannedProducts}
                />
            );
        })}
        </div>
    )
}