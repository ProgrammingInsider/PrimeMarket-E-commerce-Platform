import { createContext, useContext, useState } from "react";
const GlobalContext = createContext();

const ContextAPI = ({ children }) => {
  const alertTypes = {
    error: "errorAlert",
    warning: "warningAlert",
    success: "successAlert",
  };
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [filters, setFilters] = useState({
    Category: "All",
    Lower_Price: "",
    Higher_Price: "",
    Ratings: "",
    search: "",
  });
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [alertVisibility, setAlertVisibility] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [cartItem, setCartItem] = useState("");
  const [auth, setAuth] = useState({
    accessToken: "",
    firstname: "",
    lastname: "",
    userId: "",
  });

  const showDialogBox = (visibility, type, message) => {
    setAlertVisibility(visibility);
    setAlertType(alertTypes[type]);
    setAlertMessage(message);
  };

  return (
    <GlobalContext.Provider
      value={{
        alertVisibility,
        alertType,
        alertMessage,
        showDialogBox,
        auth,
        setAuth,
        cartItem,
        setCartItem,
        filters,
        setFilters,
        activeCategory,
        setActiveCategory,
        activeSubCategory,
        setActiveSubCategory,
        theme,
        setTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextAPI;

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
