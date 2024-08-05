import { Outlet } from "react-router-dom";
import Alert from "../components/layout/Alert";
import ScrollToTop from "./ScrollToTop";
import { useGlobalContext } from "../context/ContextAPI";
import { useEffect } from "react";

const RootLayout = () => {
  const { theme } = useGlobalContext();
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme;
  }, [theme]);
  return (
    <>
      <ScrollToTop />
      <Alert />
      <Outlet />
    </>
  );
};

export default RootLayout;
