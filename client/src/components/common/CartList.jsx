import CartItem from "./CartItem";
import styles from "../../assets/styles/Pages/CartPage.module.css";

const CartList = ({ cartItems, dispatch }) => {
  return (
    <>
      <section className={styles.cartLists}>
        <div className={styles.itemsContainer}>
          {cartItems.map((item) => {
            const { product } = item;
            return (
              <CartItem
                key={item._id}
                item={product}
                id={item._id}
                qty={item.quantity}
                dispatch={dispatch}
              />
            );
          })}
        </div>
      </section>
    </>
  );
};

export default CartList;
