import React, { useState, useEffect } from "react";
import styles from "../../assets/styles/Pages/CartPage.module.css";

const Checkout = ({ cartItems }) => {
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate subtotal
    const newSubTotal = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    setSubTotal(newSubTotal);

    const taxRate = 0.1;
    const taxAmount = newSubTotal * taxRate;
    const shippingCost = 5;
    const newTotal = newSubTotal + taxAmount + shippingCost;
    setTotal(newTotal);
  }, [cartItems]);

  return (
    <>
      <section className={styles.checkoutContainer}>
        <table className={styles.checkoutTable}>
          <tbody>
            <tr>
              <td>Sub Total:</td>
              <td>${subTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (10%):</td>
              <td>${(subTotal * 0.1).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td>$5.00</td>
            </tr>
            <tr className={styles.totalPrice}>
              <td>Total:</td>
              <td>${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <button className={`${styles.checkoutBtn} ${styles.cartBtn}`}>
          Checkout
        </button>
      </section>
    </>
  );
};

export default Checkout;
