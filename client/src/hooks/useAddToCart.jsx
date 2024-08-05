import useAxiosPrivate from "./useAxiosPrivate";
import { useGlobalContext } from "../context/ContextAPI";

const useAddToCart = () => {
  const { auth, setCartItem, showDialogBox } = useGlobalContext();
  const axiosPrivate = useAxiosPrivate();

  const addToCart = async (productid) => {
    if (auth.userId === "") {
      showDialogBox(true, "warning", "Please Login First");
      return;
    }

    try {
      const { data } = await axiosPrivate.post("/addtocart", {
        productid: productid,
      });

      const { message } = data;
      showDialogBox(true, "success", message);
      setCartItem((prev) => prev + 1);
    } catch (error) {
      if (error.response.status === 401) {
        showDialogBox(true, "warning", error.response.data.message);
      } else if (error.response.status === 400) {
        showDialogBox(true, "error", error.response.data.message);
      } else if (error.response.status === 409) {
        showDialogBox(true, "warning", error.response.data.message);
      } else {
        showDialogBox(true, "error", error.response.data.message);
      }
    }
  };

  return addToCart;
};

export default useAddToCart;
