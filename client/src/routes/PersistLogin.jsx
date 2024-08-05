import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/ContextAPI";

const PersistLogin = () => {
  const { auth } = useGlobalContext();
  const refresh = useRefreshToken();
  const [isTokenRefreshed, setIsTokenRefreshed] = useState(false);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
        setIsTokenRefreshed(true);
      } catch (err) {
        console.error(err);
      }
    };

    if (!auth?.accessToken && !isTokenRefreshed) {
      verifyRefreshToken();
    }
  }, [auth?.accessToken, isTokenRefreshed, refresh]);

  return <Outlet />;
};

export default PersistLogin;
