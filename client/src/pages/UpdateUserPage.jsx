import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "../assets/styles/Pages/UpdateuserPage.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import BarsAnimation from "../assets/images/Bars-animation.svg";
import { useGlobalContext } from "../context/ContextAPI";
import FormInput from "../components/common/FormInput";
import { updateUserValidation } from "../utils/formInputValidation";

// Axios
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const UpdateUserPage = () => {
  const { auth, setAuth, showDialogBox } = useGlobalContext();
  const axiosPrivate = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateUserValidation),
  });

  useEffect(() => {
    document.title = `Edit user Info - primemarket.com`;
  }, []);

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
    const fetchProfile = async () => {
      const { userId } = auth;
      try {
        const { data } = await axiosPrivate.get(`/getprofile/${userId}`);

        const { result } = data;

        const { firstname, lastname, email, phone, address } = result;
        const { street, city, country, state, postalCode } = address;

        const formData = {
          firstname,
          lastname,
          email,
          phone,
          street,
          city,
          country,
          state,
          postalCode: postalCode || "",
        };

        reset(formData);
      } catch (error) {
        const message =
          error.response?.data.message ||
          "Something went wrong please try again";
        showDialogBox(true, "error", message);
      } finally {
      }
    };

    if (auth?.userId) {
      fetchProfile();
    }
  }, [auth, axiosPrivate, reset]);

  const updateUser = async (data) => {
    console.log("yes");
    if (!auth?.userId) return;
    try {
      const response = await axiosPrivate.put("/updateprofile", {
        _id: auth.userId,
        ...data,
      });
      const { message } = response.data;

      showDialogBox(true, "success", message);

      if (
        auth.userId.lastname !== data.lastname ||
        auth.userId.firstname !== data.firstname
      ) {
        setAuth({
          ...auth,
          ...(auth.userId.lastname !== data.lastname && {
            lastname: data.lastname,
          }),
          ...(auth.userId.firstname !== data.firstname && {
            firstname: data.firstname,
          }),
        });
      }
    } catch (error) {
      if (error.response.data.message === "Email already taken") {
        showDialogBox(true, "error", "Email already taken");
      } else {
        const message =
          error.response?.data.message ||
          "Something went wrong, please try again later";
        showDialogBox(true, "error", message);
      }
    }
  };

  useEffect(() => {
    const firstnameInput = document.getElementById("firstname");
    firstnameInput.focus();
  }, []);
  return (
    <>
      <main>
        <section className={styles.formContainer}>
          <form className={styles.form} onSubmit={handleSubmit(updateUser)}>
            <h1 className={styles.formHeader}>Edit Profile</h1>

            <div className={styles.inputRowContainer}>
              <div className={styles.input1}>
                <FormInput
                  label="First Name"
                  register={register}
                  errors={errors}
                  id="firstname"
                  type="text"
                  maxLength={50}
                  required
                />
              </div>
              <div className={styles.input2}>
                <FormInput
                  label="Last Name"
                  register={register}
                  errors={errors}
                  id="lastname"
                  type="text"
                  maxLength={50}
                  required
                />
              </div>
            </div>
            <FormInput
              label="Email"
              register={register}
              errors={errors}
              id="email"
              type="email"
              maxLength={320}
              required
            />
            <FormInput
              label="Phone Number"
              register={register}
              errors={errors}
              id="phone"
              type="text"
              maxLength={20}
              required
            />
            <div className={styles.inputRowContainer}>
              <div className={styles.input1}>
                <FormInput
                  label="Street"
                  register={register}
                  errors={errors}
                  id="street"
                  type="text"
                  maxLength={150}
                  required
                />
              </div>
              <div className={styles.input2}>
                <FormInput
                  label="City"
                  register={register}
                  errors={errors}
                  id="city"
                  type="text"
                  maxLength={100}
                  required
                />
              </div>
            </div>
            <div className={styles.inputRowContainer}>
              <div className={styles.input1}>
                <FormInput
                  label="State"
                  register={register}
                  errors={errors}
                  id="state"
                  type="text"
                  maxLength={50}
                  required
                />
              </div>
              <div className={styles.input2}>
                <FormInput
                  label="Country"
                  register={register}
                  errors={errors}
                  id="country"
                  type="text"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div className={styles.inputRowContainer}>
              <div className={styles.input1}>
                <FormInput
                  label="Postal Code"
                  register={register}
                  errors={errors}
                  id="postalCode"
                  type="text"
                  maxLength={20}
                  required={false}
                />
              </div>
            </div>

            {/* <button
            type="submit"
            id="submit"
            className={`${styles.input} ${styles.button}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <img
                src={BarsAnimation}
                className="barsAnimation"
                alt="Loading"
              />
            ) : (
              "Edit Profile"
            )}
          </button> */}
            <button
              type="submit"
              id="submit"
              className={`${styles.input} ${styles.button}`}
              // disabled={isSubmitting}
            >
              Edit Profile
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default UpdateUserPage;
