import React from "react";
import { FaStar } from "react-icons/fa6";
import { FaStarHalfStroke } from "react-icons/fa6";
import { GoStarFill } from "react-icons/go";
import styles from "../../assets/styles/components/ProductRate.module.css";

const ProductRate = ({
  averageRating,
  ratingCount,
  showNumberofReviews = true,
  displayColumn = false,
  size = "small",
}) => {
  const averageRatingIsNotInteger = !Number.isInteger(averageRating);
  const sizeStyles =
    size === "small" ? styles.smallRateIcon : styles.largeRateIcon;

  return (
    <div
      className={
        displayColumn
          ? `${styles.productRate} ${styles.displayColumn}`
          : `${styles.productRate}`
      }
    >
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (
            averageRatingIsNotInteger &&
            Math.floor(averageRating) + 1 === star
          ) {
            return (
              <FaStarHalfStroke
                key={star}
                className={`${sizeStyles} ${styles.fillIcon}`}
              />
            );
          }
          return averageRating >= star ? (
            <FaStar key={star} className={`${sizeStyles} ${styles.fillIcon}`} />
          ) : (
            <GoStarFill
              key={star}
              className={`${sizeStyles} ${styles.noFillIcon}`}
            />
          );
        })}
      </div>

      {showNumberofReviews && (
        <span
          className={
            size === "small"
              ? `${styles.rateCount}`
              : displayColumn === true
                ? `${styles.rateCount} ${styles.largeText} ${styles.textMargin}`
                : `${styles.rateCount} ${styles.largeText}`
          }
        >
          ({ratingCount} reviews)
        </span>
      )}
    </div>
  );
};

export default ProductRate;
