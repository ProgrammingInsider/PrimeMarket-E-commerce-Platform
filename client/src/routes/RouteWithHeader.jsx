import { NavLink, Outlet } from "react-router-dom";

// LAYOUT COMPONENTS
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const RouteWithHeader = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RouteWithHeader;
