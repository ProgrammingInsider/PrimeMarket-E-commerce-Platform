import { useState, useEffect } from "react";
import styles from "../assets/styles/Pages/HomePage.module.css";
import AllProducts from "../components/common/AllProducts";
import FilterProducts from "../components/common/FilterProducts";
import { useGlobalContext } from "../context/ContextAPI";

const HomePage = () => {
  const [closeFilter, setCloseFilter] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const { filters, setFilters } = useGlobalContext();
  const [ratings, setRatings] = useState(-1);
  const [lowerPrice, setLowerPrice] = useState("");
  const [higherPrice, setHigherPrice] = useState("");
  const {
    searchWord,
    setSearchWord,
    activeCategory,
    setActiveCategory,
    activeSubCategory,
    setActiveSubCategory,
  } = useGlobalContext();

  useEffect(() => {
    document.title = `Home - primemarket.com`;
  }, []);

  return (
    <>
      <section className={`${styles.homePageContainer}`}>
        <FilterProducts
          setCloseFilter={setCloseFilter}
          filters={filters}
          setFilters={setFilters}
          closeFilter={closeFilter}
          ratings={ratings}
          setRatings={setRatings}
          lowerPrice={lowerPrice}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeSubCategory={activeSubCategory}
          setActiveSubCategory={setActiveSubCategory}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
        />
        <AllProducts
          setCloseFilter={setCloseFilter}
          filters={filters}
          setFilters={setFilters}
          closeFilter={closeFilter}
          setRatings={setRatings}
          setHigherPrice={setHigherPrice}
          setLowerPrice={setLowerPrice}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeSubCategory={activeSubCategory}
          setActiveSubCategory={setActiveSubCategory}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          searchWord={searchWord}
          setSearchWord={setSearchWord}
        />
      </section>
    </>
  );
};

export default HomePage;
