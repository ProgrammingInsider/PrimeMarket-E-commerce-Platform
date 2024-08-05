import { refreshToken } from "../services/authServices";
import { useGlobalContext } from "../context/ContextAPI";

const useRefreshToken = () => {
  const { setAuth } = useGlobalContext();

  const refresh = async () => {
    try {
      const { statusCode, ...result } = await refreshToken();

      if (statusCode === 200) {
        setAuth((prev) => ({ ...prev, ...result }));
        return result.accessToken; // Return only the access token
      } else {
        // Handle token refresh failure
        setAuth({ accessToken: "", firstname: "", lastname: "", userId: "" });
        return null;
      }
    } catch (error) {
      // Handle error and reset auth state
      setAuth({ accessToken: "", firstname: "", lastname: "", userId: "" });
      return null;
    }
  };

  return refresh;
};

export default useRefreshToken;
