import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/ContextAPI";
import { axiosPrivate } from "../services/axios";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth, setAuth } = useGlobalContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          if (isRefreshing) {
            // Wait for the current refresh attempt to complete
            return new Promise((resolve, reject) => {
              const interval = setInterval(() => {
                if (!isRefreshing) {
                  clearInterval(interval);
                  if (prevRequest.sent) {
                    resolve(axiosPrivate(prevRequest));
                  } else {
                    reject(error);
                  }
                }
              }, 1000);
            });
          }

          setIsRefreshing(true);
          prevRequest.sent = true;

          try {
            const accessToken = await refresh();
            if (accessToken) {
              prevRequest.headers["Authorization"] = `Bearer ${accessToken}`;
              setIsRefreshing(false);
              return axiosPrivate(prevRequest);
            } else {
              // Handle refresh failure (e.g., redirect to login)
              setAuth({
                accessToken: "",
                firstname: "",
                lastname: "",
                userId: "",
              });
              setIsRefreshing(false);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Handle refresh error
            setAuth({
              accessToken: "",
              firstname: "",
              lastname: "",
              userId: "",
            });
            setIsRefreshing(false);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh, isRefreshing, setAuth]);

  return axiosPrivate;
};

export default useAxiosPrivate;
