import { axiosPrivate } from "../services/axios";

const useProducts = () => {
  const fetchProducts = async (
    categoryid = "",
    rating = "",
    lowprice = "",
    highprice = "",
    sort = "",
    parentcategory = "",
    search = "",
  ) => {
    try {
      const { data } = await axiosPrivate.get(
        `/products?categoryid=${categoryid}&parentcategory=${parentcategory}&rating=${rating}&lowprice=${lowprice}&highprice=${highprice}&sort=${sort}&search=${search}`,
      );

      const { results } = await data;

      return { filteredProducts: results, message: "" };
    } catch (error) {
      const message = error.response?.data.message || "Something went wrong";
      return { filteredProducts: [], message: message };
    }
  };
  return fetchProducts;
};

export default useProducts;
