import styles from "../assets/styles/Pages/ProductDetailPage.module.css";
import Rating from "../components/common/Rating";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useState, useEffect } from "react";
import ProductCardDisplay from "../components/common/ProductCardDisplay";
import ProductDetail from "../components/common/ProductDetail";
import useProducts from "../hooks/useProducts";

const ProductDetailPage = () => {
  const { productid } = useParams();
  const [product, setProduct] = useState({});
  const [category, setCategory] = useState("");
  const [ratingCount, setRatingCount] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [message, setMessage] = useState("");
  const [relatedProduct, setRelatedProduct] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const similarProducts = useProducts();

  useEffect(() => {
    if (product.name !== undefined) {
      document.title = `${product?.name} - primemarket.com`;
    }
  }, [product]);

  useEffect(() => {
    if (Object.keys(product).length === 0) return;

    const fetchRelatedProduct = async () => {
      const { category } = product;

      const { filteredProducts } = await similarProducts(category);

      setRelatedProduct(filteredProducts);

      if (filteredProducts.length === 0) {
        setMessage("No Related Products");
      }
    };

    fetchRelatedProduct();
  }, [product, axiosPrivate]);

  return (
    <>
      <section className="mainSection1">
        <ProductDetail
          productid={productid}
          product={product}
          message={message}
          setMessage={setMessage}
          setCategory={setCategory}
          setProduct={setProduct}
          setRatingCount={setRatingCount}
          setAverageRating={setAverageRating}
        />
      </section>
      {product && Object.keys(product).length > 0 && (
        <>
          <Rating
            ratingCount={ratingCount}
            averageRating={averageRating}
            productid={productid}
          />
        </>
      )}

      {product && Object.keys(product).length > 0 && (
        <section className="mainSection1">
          <section className={`styles.productSection section`}>
            <div className={styles.sectionHeader}>
              <h1 className="sectionHeader">Related Products</h1>
            </div>
            <ProductCardDisplay
              products={relatedProduct}
              message={message}
              grid={""}
            />
          </section>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;
