import { useEffect, useState, useReducer } from "react";
import styles from "../assets/styles/Pages/CartPage.module.css";
import CartList from "../components/common/CartList";
import Checkout from "../components/common/Checkout";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useGlobalContext } from "../context/ContextAPI";
import { cartItemsReducer } from "../reducer/cartItemsReducer";
import CircleLoader from "../components/common/CircleLoader";

const CartPage = () => {
  const [cartItems, dispatch] = useReducer(cartItemsReducer, []);
  const [message, setMessage] = useState();
  const [length, setLength] = useState(0);
  const {} = useGlobalContext();
  const { auth, setCartItem } = useGlobalContext();

  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    document.title = "Cart Items - primemarket.com";
  }, []);

  useEffect(() => {
    if (auth.userId === "") {
      setMessage("Please Signin First");
      return;
    }

    const getCartItem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosPrivate.get("/getcart");

        const { length, result } = data;

        dispatch({ type: "FETCH", items: result });
        setLength(length);
        setCartItem(result.length);
      } catch (error) {
        setLoading(false);
        setMessage("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    cartItems.length > 0 || getCartItem();
  }, [auth]);

  return (
    <>
      <section className={`section`}>
        <div style={{ position: "relative", minHeight: "60vh" }}>
          {loading ? (
            <CircleLoader />
          ) : (
            <h1 className={`sectionHeader ${styles.itemHeader}`}>
              {!auth?.userId
                ? "Please Login First"
                : `${cartItems.length} items in the cart`}
            </h1>
          )}

          {cartItems.length > 0 && (
            <div className={styles.cartContainer}>
              <CartList cartItems={cartItems} dispatch={dispatch} />
              <Checkout cartItems={cartItems} />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;
