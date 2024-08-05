import React, { useState, useEffect } from "react";
import styles from "../../assets/styles/components/Header.module.css";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useGlobalContext } from "../../context/ContextAPI";
import useLogout from "../../hooks/useLogout";
import { MdLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";

// Icon
import { MdAccountCircle } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import AllCategories from "./AllCategories";

const Menu = ({ menu, showMenu }) => {
  const [searchBar, showSearchBar] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { auth, setCartItem, cartItem, theme, setTheme } = useGlobalContext();
  const { userId, firstname, lastname } = auth;
  const logout = useLogout();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (Object.keys(auth).length === 0) return;

    const getCartItem = async () => {
      try {
        const { data } = await axiosPrivate.get("/getcart");
        const { length } = data;

        setCartItem(length);
      } catch (error) {
        console.log("something went wrong, please try again");
      }
    };

    auth.userId === "" || getCartItem();
  }, [auth]);

  const submitLogout = async () => {
    logout();
  };

  return (
    <>
      {showCategories && (
        <AllCategories setShowCategories={setShowCategories} />
      )}
      <div
        className={
          menu
            ? `${styles.menuContainer} ${styles.showMenuContainer}`
            : `${styles.menuContainer}`
        }
      >
        <nav className={styles.nav}>
          <div className={styles.menuLogo}>
            <Logo />
            <MdOutlineClose
              className={styles.closeMenu}
              onClick={() => showMenu(false)}
              data-testid="closeMenu"
            />
          </div>
          <div
            className={`${styles.navLink} ${styles.navAllCategories}`}
            onClick={() => {
              setShowCategories(true);
              showMenu(false);
            }}
          >
            <span className={styles.navIcon}>
              <BiSolidCategory />
            </span>
            All Categories
          </div>
          <NavLink
            className={`${styles.navLink} ${styles.navSearch}`}
            onClick={() => {
              showSearchBar(true);
            }}
          >
            <span className={styles.navIcon}>
              <FaSearch />
            </span>
            Search
          </NavLink>
          <div
            className={
              searchBar
                ? `${styles.search} ${styles.showSearch}`
                : `${styles.search}`
            }
          >
            <MdOutlineClose
              className={styles.hideSearch}
              onClick={() => showSearchBar(false)}
            />
            <SearchBar
              showMenu={showMenu}
              showSearchBar={showSearchBar}
              className={styles.searchBar}
            />
          </div>

          <NavLink
            to={userId ? `profile/${userId}` : "/signin"}
            onClick={() => showMenu(false)}
            className={`${styles.navLink} ${styles.navAccount}`}
          >
            <span className={styles.navIcon}>
              <MdAccountCircle />
            </span>
            <span className={styles.navText}>
              {userId ? (
                <p>
                  Account
                  <sub>
                    <Link onClick={submitLogout} className={styles.logoutBtn}>
                      Logout
                    </Link>
                  </sub>
                </p>
              ) : (
                "Sign In"
              )}
            </span>
            <div className={styles.loginIndicator}>
              {userId ? (
                <p>
                  <b>
                    {firstname}&nbsp;{lastname}&nbsp;
                  </b>
                  ,
                  <sub>
                    <Link onClick={submitLogout} className={styles.logoutBtn}>
                      Logout
                    </Link>
                  </sub>
                </p>
              ) : (
                <p>
                  Login in first <Link to={"/signin"}>Signin</Link>
                </p>
              )}
            </div>
          </NavLink>

          <NavLink
            to="/cart"
            onClick={() => showMenu(false)}
            className={styles.navLink}
          >
            <span className={styles.navIcon}>
              <FaShoppingCart />
            </span>
            <span className={styles.navText}>Cart</span>
            {auth.userId !== "" && (
              <span className={styles.cartItem}>{cartItem}</span>
            )}
          </NavLink>

          {theme === "lightTheme" ? (
            <div
              onClick={() => {
                showMenu(false);
                setTheme("darkTheme");
              }}
              className={styles.navLink}
            >
              <span className={styles.navIcon}>
                <MdDarkMode />
              </span>
              <span className={styles.navText}>Dark</span>
            </div>
          ) : (
            <div
              onClick={() => {
                showMenu(false);
                setTheme("lightTheme");
              }}
              className={styles.navLink}
            >
              <span className={styles.navIcon}>
                <MdLightMode />
              </span>
              <span className={styles.navText}>Light</span>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Menu;
