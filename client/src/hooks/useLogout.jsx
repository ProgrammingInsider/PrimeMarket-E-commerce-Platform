import { useGlobalContext } from "../context/ContextAPI";
import { axiosPrivate } from "../services/axios";

const useLogout = () => {
  const { setAuth } = useGlobalContext();

  const logout = async () => {
    setAuth({ accessToken: "", firstname: "", lastname: "", userId: "" });

    try {
      await axiosPrivate.get("/logout", {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    }
  };
  return logout;
};

export default useLogout;
