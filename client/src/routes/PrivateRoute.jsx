import { Navigate, Outlet } from "react-router-dom";
import { useGlobalContext } from "../context/ContextAPI";

const PrivateRoute = () => {
  const { auth } = useGlobalContext();

  return <>{!auth?.userId ? <Navigate to={"*"} /> : <Outlet />}</>;
};

export default PrivateRoute;
