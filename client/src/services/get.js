import { axiosPrivate } from "./axios";

export const getCategories = async () => {
  try {
    const { data } = await axiosPrivate.get("/productcategory");

    return { ...data, statusCode: 200 };
  } catch (error) {
    const data = error.response ? error.response.data : null;

    if (!data?.message) {
      return {
        ...data,
        message: "Something went wrong. Try again later.",
        statusCode: error.response?.status || 500,
      };
    }

    return { ...data, statusCode: error.response?.status || 500 };
  }
};
