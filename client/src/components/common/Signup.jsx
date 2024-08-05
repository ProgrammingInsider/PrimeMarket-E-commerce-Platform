import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { TiInfoLarge } from "react-icons/ti";
import styles from "../../assets/styles/components/Signup.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import BarsAnimation from "../../assets/images/Bars-animation.svg";
import { useGlobalContext } from "../../context/ContextAPI";
import FormInput from "./FormInput";
import { signupValidation } from "../../utils/formInputValidation";
import Logo from "./Logo";

// Axios
import { signupUser } from "../../services/authServices";

const Signup = () => {
  const { showDialogBox } = useGlobalContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(signupValidation),
  });

  const acceptTerms = watch("acceptTerms", false);

  const registerUser = async (data) => {
    let alertType = "error";
    try {
      const { message, statusCode } = await signupUser(data);

      if (statusCode === 200) {
        alertType = "success";
        reset();
      }

      if (statusCode === 409) {
        setError("email", { message });
      }

      if (statusCode === 400) {
        setError("confirmpassword", { message });
      }
      showDialogBox(true, alertType, message);
    } catch (error) {
      showDialogBox(
        true,
        "error",
        "Something went wrong, please try again later",
      );
    }
  };

  useEffect(() => {
    const firstnameInput = document.getElementById("firstname");
    firstnameInput.focus();
  }, []);

  return (
    <>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <section className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit(registerUser)}>
          <h1 className={styles.formHeader}>Create account</h1>

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
                dataCy="firstname"
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
                dataCy="lastname"
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
            dataCy="email"
          />
          <FormInput
            label="Phone Number"
            register={register}
            errors={errors}
            id="phone"
            type="text"
            maxLength={20}
            required
            dataCy="phone"
          />
          <FormInput
            label="Password"
            register={register}
            errors={errors}
            id="password"
            type="password"
            minLength={6}
            required
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            dataCy="password"
          />
          <p className={styles.inputInfo}>
            <TiInfoLarge />
            <span>Password must be at least 6 characters long</span>
          </p>
          <FormInput
            label="Confirm Password"
            register={register}
            errors={errors}
            id="confirmpassword"
            type="password"
            minLength={6}
            required
            dataCy="confirmpassword"
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
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
                dataCy="street"
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
                dataCy="city"
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
                dataCy="state"
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
                dataCy="country"
              />
            </div>
          </div>
          <div className={styles.checkboxContainer}>
            <div className={styles.checkboxInputContainer}>
              <input
                type="checkbox"
                id="acceptTerms"
                {...register("acceptTerms")}
                data-cy="acceptTerms"
                className={styles.checkbox}
              />
              <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
                I accept the <Link to="/terms">terms and conditions</Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <span id="acceptTerms-error" className={styles.formError}>
                {errors.acceptTerms.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            id="submit"
            className={`${styles.input} ${styles.button}`}
            disabled={isSubmitting || !acceptTerms}
            dataCy="submit"
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
              Already have an account? <Link to={"/signin"}>Sign in</Link> here
            </span>
          </p>
        </form>
      </section>
    </>
  );
};

export default Signup;
