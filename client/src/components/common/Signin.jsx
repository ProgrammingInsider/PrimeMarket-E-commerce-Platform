import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../assets/styles/components/Signin.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import BarsAnimation from "../../assets/images/Bars-animation.svg";
import { useGlobalContext } from "../../context/ContextAPI";
import FormInput from "./FormInput";
import { signinValidation } from "../../utils/formInputValidation";
import Logo from "./Logo";

// Axios
import { signinUser } from "../../services/authServices";

const Signin = () => {
  const { showDialogBox, setAuth } = useGlobalContext();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(signinValidation),
  });

  const loginUser = async (data) => {
    let alertType = "error";
    try {
      const { message, statusCode, ...result } = await signinUser(data);

      if (statusCode === 200) {
        setAuth((prev) => {
          return result;
        });
        alertType = "success";
        reset();
        navigate("/");
      }

      if (statusCode === 401 && message === "Email address is not registered") {
        setError("email", { message });
      }

      if (statusCode === 401 && message === "Incorrect Password") {
        setError("password", { message });
      }

      showDialogBox(true, alertType, message);
    } catch (error) {
      showDialogBox(true, "error", "Something went wrong try again later");
    }
  };

  useEffect(() => {
    const firstnameInput = document.getElementById("email");
    firstnameInput.focus();
  }, []);

  return (
    <>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <section className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit(loginUser)}>
          <h1 className={styles.formHeader}>Sign in</h1>

          <FormInput
            label="Email"
            register={register}
            errors={errors}
            id="email"
            type="email"
            maxLength={320}
            required
            dataCy="email"
          />

          <FormInput
            label="Password"
            register={register}
            errors={errors}
            id="password"
            type="password"
            minLength={6}
            required
            dataCy="password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <button
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
              "Continue"
            )}
          </button>
          <p className={styles.inputInfo}>
            <span>
              You did not have an account? <Link to={"/signup"}>Sign up</Link>{" "}
              here
            </span>
          </p>
        </form>
      </section>
    </>
  );
};

export default Signin;
