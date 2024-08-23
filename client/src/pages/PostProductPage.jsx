import { useForm } from "react-hook-form";
import styles from "../assets/styles/Pages/PostproductPage.module.css";
import FormInput from "../components/common/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import productSchema from "../utils/productSchema";
import { useEffect, useState } from "react";
import { getCategories } from "../services/get";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useGlobalContext } from "../context/ContextAPI";
import { useParams } from "react-router-dom";
import CircleLoader from "../components/common/CircleLoader";

const PostProductPage = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [oldPublicId, setOldPublicId] = useState("");
  const [imageFile, setImageFile] = useState();
  const [fileError, setFileError] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const { showDialogBox } = useGlobalContext();
  const { productid } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data } = await axiosPrivate.get(`/getproduct/${productid}`);

        const { result } = data;

        const {
          brand,
          category,
          description,
          dimensions,
          imageUrl,
          name,
          price,
          sku,
          stock,
          weight,
          publicId,
        } = result;
        reset({
          brand,
          category,
          description,
          dimensions,
          name,
          price,
          sku,
          stock,
          weight,
        });
        setCategoryId(category);
        setImageUrl(imageUrl);
        setOldPublicId(publicId);
      } catch (error) {
        console.log("Something went wrong!");
      }
    };

    if (productid) {
      getProduct();
    }
  }, [productid]);

  useEffect(() => {
    if (productid) {
      document.title = `Edit product - primemarket.com`;
    } else {
      document.title = `Create new product - primemarket.com`;
    }
  }, [productid]);

  useEffect(() => {
    const fetChCategories = async () => {
      try {
        const response = await getCategories();

        const { results } = response;

        const mainCategory = results.filter((result) => {
          if (result.parent_category !== null) {
            return result;
          }
        });

        setCategories(mainCategory);
      } catch (error) {
        console.log("something went wrong, please try again");
      }
    };

    categories.length > 0 || fetChCategories();
  }, []);

  const editProduct = async (data) => {
    if (!productid) return;

    const formData = new FormData();

    if (imageFile) {
      formData.append("imageUrl", imageFile);
    }

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (!data.sku) {
      formData.append("sku", "");
    }

    formData.append("_id", productid);
    formData.append("oldPublicId", oldPublicId);

    try {
      setLoading(true);
      const response = await axiosPrivate.put(
        "/updateproductfromcloudinary",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const { message } = response.data;

      showDialogBox(true, "success", message);
      reset(data);
    } catch (error) {
      showDialogBox(true, "error", error.response.data.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data) => {
    if (productid) return;

    const formData = new FormData();

    if (imageFile) {
      formData.append("imageUrl", imageFile);
    } else {
      setFileError(true);
      setFileErrorMessage("Product image is required");
      return;
    }

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (!data.sku) {
      formData.append("sku", "");
    }

    try {
      for (const [key, value] of formData.entries()) {
        console.log(key + " " + value);
      }
      setLoading(true);
      const { data } = await axiosPrivate.post(
        "/postproducttocloudinary",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const { message } = data;
      showDialogBox(true, "success", message);
      setImageUrl("");
      reset();
    } catch (error) {
      setLoading(false);
      showDialogBox(true, "error", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setFileError(false);
    setFileErrorMessage("");
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError(true);
        setFileErrorMessage("File size exceeds 5MB");
        return;
      }

      const allowedTypes = ["jpeg", "jpg", "png", "gif"];
      const ext = file.name.split(".").pop().toLowerCase();

      if (!allowedTypes.includes(ext)) {
        setFileError(true);
        setFileErrorMessage(
          "Invalid File Extension, it should be jpeg, jpg, png, gif",
        );
        return;
      }

      setImageFile(file);
      const objectURL = URL.createObjectURL(file);
      setImageUrl(objectURL);
    } else {
      setFileError(true);
      setFileErrorMessage("product image is required");
    }
  };

  return (
    <>
      <section className={`section ${styles.postProductContainer}`}>
        {productid ? (
          <h1 className="sectionHeader">Edit Product</h1>
        ) : (
          <h1 className="sectionHeader">Create Product</h1>
        )}

        <form
          className={styles.productDetailContainer}
          onSubmit={
            !productid ? handleSubmit(createProduct) : handleSubmit(editProduct)
          }
        >
          <div className={styles.productDetail}>
            <h3 className="sectionHeader">Basic Information</h3>
            <div className={styles.basicInformation}>
              <div className={styles.productImageContainer}>
                <label
                  htmlFor="file"
                  className={styles.previewContainer}
                  aria-label="choose image"
                >
                  {!imageUrl ? (
                    "Choose Image"
                  ) : (
                    <img src={imageUrl} alt="Product Image Preview" />
                  )}
                </label>
                <input
                  type="file"
                  id="file"
                  name="imageUrl"
                  style={{ display: "none" }}
                  aria-invalid={fileError ? "true" : "false"}
                  aria-describedby={fileError ? `file-error` : undefined}
                  onChange={handleImageChange}
                />
                {fileError && (
                  <span
                    id={`file-error`}
                    aria-live="assertive"
                    className={styles.formError}
                  >
                    {fileErrorMessage}
                  </span>
                )}
              </div>
              <div className={styles.productBasicInfo}>
                <div className={styles.inputContainer}>
                  <label htmlFor="category" aria-label="Insert your category">
                    Category
                  </label>
                  <select
                    id="category"
                    {...register("category")}
                    name="category"
                    className={`${styles.input} ${styles.categorySelect}`}
                    required={true}
                    aria-invalid={errors["category"] ? "true" : "false"}
                    aria-describedby={
                      errors["category"] ? `category-error` : undefined
                    }
                    defaultValue={categoryId}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => {
                      return (
                        <option key={category._id} value={category._id}>
                          {category.category_name}
                        </option>
                      );
                    })}
                  </select>
                  {errors["category"] && (
                    <span
                      id={`category-error`}
                      aria-live="assertive"
                      className={styles.formError}
                    >
                      {errors["category"].message}
                    </span>
                  )}
                </div>
                <FormInput
                  label="Name"
                  register={register}
                  errors={errors}
                  id="name"
                  type="text"
                  maxLength={255}
                  required={true}
                />
                <FormInput
                  label="Price"
                  register={register}
                  errors={errors}
                  id="price"
                  type="text"
                  required={true}
                />
                <div className={styles.inputContainer}>
                  <label
                    htmlFor="description"
                    aria-label="Insert your description"
                  >
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    id="description"
                    name="description"
                    className={styles.textarea}
                    required={true}
                    maxLength={1000}
                    aria-invalid={errors["description"] ? "true" : "false"}
                    aria-describedby={
                      errors["description"] ? `description-error` : undefined
                    }
                  />
                  {errors["description"] && (
                    <span
                      id={`description-error`}
                      aria-live="assertive"
                      className={styles.formError}
                    >
                      {errors["description"].message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.productDetail}>
            <h3 className="sectionHeader">Inventory Detail</h3>
            <div className={styles.inventoryDetails}>
              <FormInput
                label="Stock"
                register={register}
                errors={errors}
                id="stock"
                type="text"
                required={true}
              />
              <FormInput
                label="Sku (optional)"
                register={register}
                errors={errors}
                id="sku"
                type="text"
                maxLength={50}
                required={false}
                disabled={!productid ? false : true}
              />
            </div>
          </div>

          <div className={styles.productDetail}>
            <h3 className="sectionHeader">Additional Attributes</h3>
            <div className={styles.additionalAtrributes}>
              <FormInput
                label="Weight"
                register={register}
                errors={errors}
                id="weight"
                type="text"
                required={false}
              />
              <FormInput
                label="Dimensions (optional)"
                register={register}
                errors={errors}
                id="dimensions"
                type="text"
                maxLength={100}
                required={false}
              />
              <FormInput
                label="Brand (optional)"
                register={register}
                errors={errors}
                id="brand"
                type="text"
                maxLength={100}
                required={false}
              />
            </div>
          </div>
          <button
            type="submit"
            id="submit"
            className={`${styles.input} ${styles.button}`}
            disabled={isSubmitting}
          >
            {loading ? (
              <CircleLoader />
            ) : !productid ? (
              "Create Product"
            ) : (
              "Edit Product"
            )}
          </button>
        </form>
      </section>
    </>
  );
};

export default PostProductPage;
