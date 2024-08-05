import React, { useState, useEffect, memo } from "react";
import styles from "../../assets/styles/Pages/ProductDetailPage.module.css";
import ProductRate from "./ProductRate.jsx";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import UserProfileLink from "./UserProfileLink";
import useAddToCart from "../../hooks/useAddToCart";
import CircleLoader from "./CircleLoader";
import ErrorPage from "../../pages/ErrorPage";

const ProductDetail = ({
  productid,
  product,
  message,
  setMessage,
  setProduct,
  setCategory,
  setRatingCount,
  setAverageRating,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const addToCart = useAddToCart();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setProductLoading(true);
        const { data } = await axiosPrivate.get(`/productdetails/${productid}`);
        const { result } = data;

        setProduct(result);
        setCategory(result.category);
        setRatingCount(result.ratingCount);
        setAverageRating(result.averageRating);
      } catch (error) {
        setProductLoading(false);

        if (error.response?.status === 400) {
          setMessage(error.response.data.message);
        } else {
          setServerError(true);
          setMessage(error.response.data.message);
        }
      } finally {
        setProductLoading(false);
      }
    };

    fetchProductDetail();
  }, [productid]);

  const handleAddToCart = async () => {
    setLoading(true);
    await addToCart(productid);
    setLoading(false);
  };

  if (
    (!product || Object.keys(product).length === 0) &&
    productLoading === false
  ) {
    return <ErrorPage message={message} serverError={serverError} />;
  }

  return (
    <>
      <section style={{ minHeight: "70vh", position: "relative" }}>
        {productLoading ? (
          <CircleLoader />
        ) : (
          product && (
            <section className={`${styles.productDetailContainer} section`}>
              <div className={styles.productImage}>
                <img src={product.imageUrl} alt="Product Image" />
              </div>
              <div className={styles.productDetail}>
                <p className={styles.productPostDate}>
                  posted {product.createdAt.split("T")[0]}
                </p>
                <h1 className={styles.productName}>{product.name}</h1>
                <ProductRate
                  averageRating={product.averageRating}
                  ratingCount={product.ratingCount}
                  size={"large"}
                />
                <h2 className={styles.productPrice}>Price ${product.price}</h2>
                <p className={styles.productDescription}>
                  {isExpanded
                    ? product.description
                    : `${product.description?.slice(0, 250)}...`}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.readMoreButton}
                  >
                    {isExpanded ? "Show less" : "See more"}
                  </button>
                </p>
                <button className={styles.addtoCart} onClick={handleAddToCart}>
                  {loading ? <CircleLoader /> : "Add to Cart"}
                </button>

                <dl className={styles.productAttributes}>
                  <div className={styles.attribute}>
                    <dt className={styles.attributeName}>Brand:</dt>
                    <dd className={styles.attributeValue}>{product.brand}</dd>
                  </div>
                  <div className={styles.attribute}>
                    <dt className={styles.attributeName}>Stock:</dt>
                    <dd className={styles.attributeValue}>
                      {product.stock > 0
                        ? `${product.stock} available`
                        : "Out of stock"}
                    </dd>
                  </div>
                  <div className={styles.attribute}>
                    <dt className={styles.attributeName}>Weight:</dt>
                    <dd className={styles.attributeValue}>
                      {product.weight} kg
                    </dd>
                  </div>
                  <div className={styles.attribute}>
                    <dt className={styles.attributeName}>Dimensions:</dt>
                    <dd className={styles.attributeValue}>
                      {product.dimensions} cm
                    </dd>
                  </div>
                </dl>

                <div className={styles.postByContainer}>
                  <UserProfileLink
                    user={{
                      _id: product.userId,
                      firstname: product.firstname,
                      lastname: product.lastname,
                      profilePic: product.profilePic,
                    }}
                    postedBy={true}
                  />
                </div>
              </div>
            </section>
          )
        )}
      </section>
    </>
  );
};

export default memo(ProductDetail);
