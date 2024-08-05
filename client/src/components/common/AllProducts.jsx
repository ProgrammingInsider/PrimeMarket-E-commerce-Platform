import React, { useEffect, useState, memo } from "react";
import styles from "../../assets/styles/Pages/HomePage.module.css";
import { FaBarsStaggered } from "react-icons/fa6";
import useProducts from "../../hooks/useProducts";
import ProductCardDisplay from "./ProductCardDisplay";
import { IoClose } from "react-icons/io5";
import CircleLoader from "./CircleLoader";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { BsFillGrid1X2Fill } from "react-icons/bs";
import { IoGridSharp } from "react-icons/io5";

const AllProducts = ({
  activeSubCategory,
  setActiveSubCategory,
  setCloseFilter,
  filters,
  setFilters,
  activeCategory,
  setActiveCategory,
}) => {
  const [products, setProducts] = useState([]);
  const [grid, setGrid] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const fetchedProducts = useProducts();

  useEffect(() => {
    const fetchFilteredProduct = async () => {
      setLoading(true);
      const { filteredProducts } = await fetchedProducts(
        activeSubCategory,
        filters.Ratings,
        filters.Lower_Price,
        filters.Higher_Price,
        sortBy,
        activeCategory,
        filters.search,
      );
      setProducts(filteredProducts);
      setMessage("");
      if (filteredProducts.length === 0) {
        setMessage("No Related Products");
      }
      setLoading(false);
    };

    fetchFilteredProduct();
  }, [filters, sortBy, activeSubCategory, activeCategory]);

  return (
    <>
      <div className={styles.allProductsContainer}>
        <div className={`${styles.header} ${styles.upperHeader}`}>
          <h4
            className={styles.clearAll}
            onClick={() => {
              setActiveSubCategory("");
              setSortBy("");
              setActiveCategory("");
              setFilters({
                Category: "All",
                Lower_Price: "",
                Higher_Price: "",
                Ratings: "",
              });
            }}
            data-cy="clearAll"
          >
            Clear All
          </h4>
          <ul className={styles.filterContainer}>
            {Object.entries(filters).map((filter, index) => {
              const [key, value] = filter;

              if (!value) return;
              return (
                <li className={styles.filter} key={index}>
                  <span className={styles.key}>{key}:</span>
                  <span className={styles.value}>
                    {key === "Ratings" ? `${value} star` : value}

                    <IoClose
                      className={styles.cancleFilter}
                      onClick={() => {
                        key === "Category" && setActiveCategory("");
                        key === "Category" && setActiveSubCategory("");
                        setFilters({
                          ...filters,
                          [key]: key === "Category" ? "All" : "",
                        });
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={`${styles.header} ${styles.lowerHeader}`}>
          <div className={styles.gridContainer}>
            <FaBarsStaggered
              className={`${styles.showFilterBar} ${styles.bar}`}
              onClick={() => setCloseFilter(true)}
            />
            <BsFillGrid1X2Fill
              className={`${styles.defaultGrid} ${styles.gridBar}`}
              onClick={() => setGrid("")}
            />
            <TfiLayoutGrid4Alt
              className={`${styles.fourGrid} ${styles.gridBar}`}
              onClick={() => setGrid("fourItems")}
            />
            <BsGrid3X3GapFill
              className={`${styles.threeGrid} ${styles.gridBar}`}
              onClick={() => setGrid("threeItems")}
            />
            <IoGridSharp
              className={`${styles.twoGrid} ${styles.gridBar}`}
              onClick={() => setGrid("twoItems")}
            />
          </div>
          <p className={styles.resultQty}>
            {products.length > 1
              ? `${products.length} results`
              : `${products.length} result`}
          </p>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.selectContainer}
          >
            <option value="recent">Most Recent</option>
            <option value="expensive">Most Expensive</option>
            <option value="cheapest">Most Cheapest</option>
            <option value="rate">Most Rated</option>
          </select>
        </div>
        <div className={styles.allProducts}>
          {loading ? (
            <CircleLoader size={120} />
          ) : (
            <ProductCardDisplay
              products={products}
              message={message}
              grid={grid}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default memo(AllProducts);
