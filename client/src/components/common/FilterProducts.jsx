import React, { useEffect, useState, memo } from "react";
import styles from "../../assets/styles/Pages/HomePage.module.css";
import ProductRate from "./ProductRate";
import { GiCheckMark } from "react-icons/gi";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { getCategories } from "../../services/get";
import { useLocation } from "react-router-dom";

const FilterProducts = ({
  activeSubCategory,
  setActiveSubCategory,
  activeCategory,
  setActiveCategory,
  closeFilter,
  setCloseFilter,
  setFilters,
  filters,
}) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const { pathname } = useLocation();

  useEffect(() => {
    if (categories.length > 0) return;

    const fetChCategories = async () => {
      try {
        const response = await getCategories();
        const { results } = response;

        const mainCategory = results.filter((result) => {
          if (result.parent_category === null) {
            return result;
          }
        });

        const subCategory = results.filter((result) => {
          if (result.parent_category !== null) {
            return result;
          }
        });

        setCategories(mainCategory);
        setSubCategories(subCategory);
      } catch (error) {
        console.log("something went wrong, please try again");
      }
    };

    fetChCategories();
  }, []);

  useEffect(() => {
    const filterSubCategory = () => {
      const result = subCategories.filter(
        (category) => category.parent_category === activeCategory,
      );
      setSubCategoryList(result);
    };

    filterSubCategory();
  }, [activeCategory, pathname, subCategories, setSubCategoryList]);

  return (
    <>
      <section
        className={
          closeFilter
            ? `section ${styles.filterSection}`
            : `section ${styles.closeFilterSection} ${styles.filterSection}`
        }
      >
        <div className={styles.closeFilterContainer}>
          <FaLongArrowAltLeft
            className={styles.closeFilter}
            onClick={() => setCloseFilter(false)}
          />
        </div>
        <ul className={styles.productFilters}>
          <h2 className={styles.filterHeader}>Category</h2>
          <div className={styles.filterOptions}>
            <li
              onClick={() => {
                setActiveSubCategory("");
                setActiveCategory("");
                setFilters({ ...filters, Category: "All" });
              }}
              key="all-categories"
            >
              <div className={styles.checkBox}>
                {activeCategory === "" && (
                  <GiCheckMark className={styles.check} />
                )}
              </div>
              <span
                className={activeCategory === 0 ? styles.active : undefined}
              >
                All
              </span>
            </li>
            {categories.map((category) => {
              return (
                <li
                  onClick={() => {
                    setActiveSubCategory("");
                    setActiveCategory(category._id);
                    setFilters({
                      ...filters,
                      Category: category.category_name,
                    });
                  }}
                  key={category._id}
                >
                  <div className={styles.checkBox}>
                    {activeCategory === category._id && (
                      <GiCheckMark className={styles.check} />
                    )}
                  </div>
                  <span
                    className={
                      activeCategory === category._id
                        ? styles.active
                        : undefined
                    }
                  >
                    {category.category_name}
                  </span>
                </li>
              );
            })}
          </div>
        </ul>
        {(subCategoryList.length > 0 || activeSubCategory) && (
          <ul className={styles.productFilters}>
            <h2 className={styles.filterHeader}>Sub-Category</h2>
            <div className={styles.filterOptions}>
              {subCategoryList.map((category) => {
                return (
                  <li
                    onClick={() => {
                      setActiveSubCategory(category._id);
                      setFilters({
                        ...filters,
                        Category: category.category_name,
                      });
                    }}
                    key={category._id}
                  >
                    <div className={styles.checkBox}>
                      {activeSubCategory === category._id && (
                        <GiCheckMark className={styles.check} />
                      )}
                    </div>
                    <span
                      className={
                        activeSubCategory === category._id
                          ? styles.active
                          : undefined
                      }
                    >
                      {category.category_name}
                    </span>
                  </li>
                );
              })}
            </div>
          </ul>
        )}
        <div className={styles.filterWithPrice}>
          <h2 className={styles.filterHeader}>Price</h2>
          <p className={styles.filterSubHeader}>Price Range</p>
          <div className={styles.priceOptions}>
            <input
              type="text"
              value={filters.Lower_Price}
              className={styles.input}
              onChange={(e) =>
                setFilters({ ...filters, Lower_Price: e.target.value })
              }
              aria-label="lower Price"
              data-cy="lowerPrice"
            />
            <span>to</span>
            <input
              type="text"
              value={filters.Higher_Price}
              className={styles.input}
              onChange={(e) =>
                setFilters({ ...filters, Higher_Price: e.target.value })
              }
              aria-label="higher Price"
              data-cy="higherPrice"
            />
          </div>
        </div>
        <ul className={styles.productFilters}>
          <h2 className={styles.filterHeader}>Ratings</h2>
          <div className={styles.filterOptions}>
            {[5, 4, 3, 2, 1].map((rate) => {
              return (
                <li
                  onClick={() => setFilters({ ...filters, Ratings: rate })}
                  title={`Filter by ${rate} rate`}
                  key={rate}
                  data-cy={`${rate} star`}
                >
                  <div className={styles.checkBox}>
                    {filters.Ratings === rate && (
                      <GiCheckMark className={styles.check} />
                    )}
                  </div>
                  <div>
                    <ProductRate
                      averageRating={rate}
                      showNumberofReviews={false}
                    />
                  </div>
                </li>
              );
            })}
          </div>
        </ul>
      </section>
    </>
  );
};

export default memo(FilterProducts);
