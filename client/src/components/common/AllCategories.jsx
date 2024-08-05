import React, { useEffect, useState } from "react";
import { FaLongArrowAltLeft } from "react-icons/fa";
import styles from "../../assets/styles/components/AllCategories.module.css";
import { getCategories } from "../../services/get";
import { useGlobalContext } from "../../context/ContextAPI";
import CircleLoader from "./CircleLoader";
import { useNavigate } from "react-router-dom";

const AllCategories = ({ setShowCategories }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    filters,
    setFilters,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
  } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (categories.length > 0) return;

    const fetChCategories = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetChCategories();
  }, []);

  useEffect(() => {
    if (
      parentCategoryId !== "" &&
      subCategoryId !== "" &&
      categoryName !== ""
    ) {
      setFilters({ ...filters, Category: categoryName });
      setActiveSubCategory(subCategoryId);
      setActiveCategory(parentCategoryId);
      navigate("/");
    }
  }, [parentCategoryId, subCategoryId, categoryName]);
  return (
    <>
      <div className={styles.allCategoriesContainer}>
        <div className={styles.closeAllCategorySection}>
          <FaLongArrowAltLeft
            className={styles.closeFilter}
            onClick={() => setShowCategories(false)}
          />
        </div>

        {loading ? (
          <CircleLoader />
        ) : (
          <div className={styles.categoriesList}>
            {categories.map((main) => {
              return (
                <div className={styles.eachCategory} key={main._id}>
                  <h1 className={styles.parentCategory}>
                    {main.category_name}
                  </h1>
                  <ul className={styles.subCategories}>
                    {subCategories.map((sub) => {
                      if (sub.parent_category === main._id) {
                        return (
                          <li
                            key={sub._id}
                            className={
                              activeSubCategory === sub._id
                                ? `${styles.activeCategory} ${styles.subCategory}`
                                : `${styles.subCategory}`
                            }
                            onClick={() => {
                              setParentCategoryId(sub.parent_category);
                              setSubCategoryId(sub._id);
                              setCategoryName(sub.category_name);
                            }}
                          >
                            {sub.category_name}
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AllCategories;
