import { useState, useEffect } from "react";
import styles from "../../assets/styles/components/SearchBar.module.css";
import { useGlobalContext } from "../../context/ContextAPI";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ showMenu, showSearchBar }) => {
  const [keyword, setKeyword] = useState("");
  const { filters, setFilters } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!filters.search) {
      setKeyword("");
    }
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword) {
      setFilters({ ...filters, search: keyword });
      showMenu(false);
      showSearchBar(false);
      navigate("/");
    } else {
      setFilters("");
    }
  };

  return (
    <form className={styles.searchBarContainer}>
      <input
        type="text"
        placeholder="What are you looking for..."
        id="searchBar"
        value={keyword}
        className={styles.input}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button
        type="submit"
        id="submit"
        className={`${styles.input} ${styles.button}`}
        disabled={keyword.length ? false : true}
        onClick={handleSearch}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
