import styles from "../../assets/styles/Pages/CartPage.module.css";
import ProductRate from "./ProductRate";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useGlobalContext } from "../../context/ContextAPI";
import CircleLoader from "./CircleLoader";

const CartItem = ({ item = {}, id, qty, dispatch }) => {
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState(item?.stock || 0);
  const [quantity, setQuantity] = useState(qty);
  const { setCartItem, showDialogBox } = useGlobalContext();
  const axiosPrivate = useAxiosPrivate();

  const handleQuantity = (iconType) => {
    let newQuantity;
    if (iconType === "minus") {
      newQuantity = Math.max(quantity - 1, 1);
    } else {
      newQuantity = Math.min(quantity + 1, stock);
    }
    setQuantity(newQuantity);
  };

  const handleInputChange = async (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= stock) {
      setQuantity(value);
    }
  };

  useEffect(() => {
    if (quantity <= 0 || quantity > stock) return;

    const updateCart = async () => {
      try {
        await axiosPrivate.put("/updatecart", {
          _id: id,
          quantity: quantity,
        });

        dispatch({ type: "UPDATE", id: id, quantity: quantity });
      } catch (error) {
        showDialogBox(true, "error", error.response.data.message);
      }
    };

    updateCart();
  }, [quantity]);

  const removeCartItem = async () => {
    try {
      setLoading(true);
      const { data } = await axiosPrivate.delete(`/removeitem/${id}`);

      const { message } = data;
      showDialogBox(true, "success", message);
      dispatch({ type: "REMOVE", id: id });
      setCartItem((prev) => prev - 1);
    } catch (error) {
      setLoading(false);
      const message = error.response?.data.message || "Something went wrong";
      showDialogBox(true, "error", message);
    } finally {
      setLoading(false);
    }
  };

  // Check if item is defined before rendering anything
  if (!item || Object.keys(item).length === 0) {
    return null; // Or return some placeholder content
  }

  return (
    stock !== 0 && (
      <div className={styles.item}>
        <div className={styles.itemImage}>
          <Link to={`/product/${item?._id}`}>
            <img src={item?.imageUrl} alt={item?.name} />
          </Link>
        </div>
        <div className={styles.itemDescContainer}>
          <div className={styles.itemDesc}>
            <span
              className={
                stock > 0
                  ? `${styles.itemAvailability} ${styles.inStock}`
                  : `${styles.itemAvailability} ${styles.outOfStock}`
              }
            >
              {stock > 0 ? "In Stock" : "Out Of Stock"}
            </span>

            <h1 className={styles.itemName}>{item?.name}</h1>
            <ProductRate
              averageRating={item?.averageRating}
              ratingCount={item?.ratingCount}
            />
            <p className={styles.itemPrice}>${item?.price}</p>
            <button
              className={`${styles.itemRemoveBtn} ${styles.cartBtn}`}
              onClick={removeCartItem}
              data-testid={`removeBtn${item?._id}`}
            >
              {loading ? <CircleLoader /> : "Remove from cart"}
            </button>
          </div>
          <div className={styles.quantityAdjustment}>
            <FaMinus
              className={styles.cartIcon}
              onClick={() => handleQuantity("minus")}
              data-testid={`minus${item?._id}`}
            />
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              className={styles.itemQuantity}
              min={1}
              max={stock}
              aria-label={`quantity-${item?._id}`}
            />
            <FaPlus
              className={styles.cartIcon}
              onClick={() => handleQuantity("plus")}
              data-testid={`plus${item?._id}`}
            />
          </div>
        </div>
      </div>
    )
  );
};

export default CartItem;
