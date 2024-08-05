import ProductCard from "./ProductCard";
import styles from "../../assets/styles/components/ProductCardDisplay.module.css";
import { memo } from "react";

const ProductCardDisplay = ({
  products,
  role,
  deleteProduct,
  message = "",
  grid = "threeItems",
}) => {
  if (products.length === 0 && message === "") {
    return <h2 className="notFoundText">No Products Uploaded</h2>;
  }

  if (message) {
    return <h2 className="notFoundText">{message}</h2>;
  }

  return (
    <div
      className={
        !grid
          ? `${styles.productDisplay}`
          : `${styles.productDisplay} ${styles[grid]}`
      }
    >
      {products.map((item) => (
        <ProductCard
          key={item?._id}
          product={item}
          role={role}
          deleteProduct={deleteProduct}
        />
      ))}
    </div>
  );
};

export default memo(ProductCardDisplay);
