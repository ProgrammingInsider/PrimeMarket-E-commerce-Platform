import { axiosPrivate } from "./axios";

export const signupUser = async (credentials) => {
  try {
    const { data } = await axiosPrivate.post("/signup", { ...credentials });

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

export const signinUser = async (credentials) => {
  try {
    const { data } = await axiosPrivate.post("/signin", { ...credentials });

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

export const refreshToken = async () => {
  try {
    const { data } = await axiosPrivate.get("/refreshtoken");

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
