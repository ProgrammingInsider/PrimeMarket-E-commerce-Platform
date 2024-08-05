import styles from "../../assets/styles/components/ProductCardDisplay.module.css";
import { FaShoppingCart } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import React, { useState, useCallback } from "react";
import CircleLoader from "./CircleLoader";
import ProductRate from "./ProductRate";
import useAddToCart from "../../hooks/useAddToCart";

const ProductCard = React.memo(({ product, role, deleteProduct }) => {
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const addToCart = useAddToCart();

  const {
    _id,
    name,
    description,
    price,
    averageRating,
    ratingCount,
    imageUrl,
    publicId,
  } = product;

  const toggleShowOptions = useCallback(() => {
    setShowOptions((prevShowOptions) => !prevShowOptions);
  }, []);

  const handleAddToCart = async () => {
    setCartLoading(true);
    await addToCart(_id);
    setCartLoading(false);
  };

  const showConfirm = () => {
    const result = confirm("Are you sure you want to delete the product?");
    if (result) {
      deleteProduct(publicId, setLoading);
    } else {
      console.log("User clicked Cancel");
    }
    setShowOptions(false);
  };

  return (
    <div className={styles.productCard} key={_id}>
      {loading && <CircleLoader data-testid={`loader${_id}`} size={60} />}
      <Link to={`/product/${_id}`} data-cy={`viewProduct${_id}`}>
        <div className={styles.imageContainer}>
          <img src={imageUrl} className={styles.productImage} alt={name} />
        </div>
      </Link>
      <div className={styles.productInfo}>
        <h1 className={styles.productName}>{name}</h1>
        <ProductRate
          key={_id}
          averageRating={averageRating}
          ratingCount={ratingCount}
        />
        <div className={styles.productBio}>{description.substring(0, 90)}</div>
        <div className={styles.productFooter}>
          <h1 className={styles.productPrice}>${price}</h1>
          <div className={styles.cartContainer}>
            {role === 112208 ? (
              <HiDotsVertical
                onClick={toggleShowOptions}
                className={styles.cardIcon}
                data-testid={`threedot${_id}`}
              />
            ) : cartLoading ? (
              <CircleLoader />
            ) : (
              <FaShoppingCart
                onClick={handleAddToCart}
                className={styles.cardIcon}
                data-testid={`cartIcon${_id}`}
                data-cy={`addTo${_id}`}
              />
            )}
            {showOptions && (
              <div className={styles.cardOptions}>
                <Link to={`/updateproduct/${_id}`}>
                  <button
                    className={styles.cardOptionsLink}
                    data-testid={`editBtn${_id}`}
                  >
                    Edit
                  </button>
                </Link>
                <Link>
                  <button
                    onClick={showConfirm}
                    className={styles.cardOptionsLink}
                    data-testid={`deleteBtn${_id}`}
                  >
                    Delete
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
