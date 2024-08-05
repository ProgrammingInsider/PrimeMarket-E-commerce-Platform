import React from "react";
import { BiShow } from "react-icons/bi";
import { BiSolidHide } from "react-icons/bi";
import styles from "../../assets/styles/components/Signup.module.css";

const FormInput = ({
  label,
  register,
  errors,
  id,
  type,
  maxLength,
  required,
  disabled,
  minLength,
  showPassword,
  setShowPassword,
  dataCy,
}) => (
  <div className={styles.inputContainer}>
    <label htmlFor={id} aria-label={`Insert your ${label}`}>
      {label}
    </label>
    <input
      {...register(id)}
      type={
        showPassword && (id === "password" || id === "confirmpassword")
          ? "text"
          : type
      }
      id={id}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      minLength={minLength}
      data-cy={dataCy}
      className={styles.input}
      aria-invalid={errors[id] ? "true" : "false"}
      aria-describedby={errors[id] ? `${id}-error` : undefined}
    />
    {(id === "password" || id === "confirmpassword") && (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={styles.showPasswordButton}
      >
        {showPassword ? <BiSolidHide /> : <BiShow />}
      </button>
    )}
    {errors[id] && (
      <span
        id={`${id}-error`}
        aria-live="assertive"
        className={styles.formError}
      >
        {errors[id].message}
      </span>
    )}
  </div>
);

export default FormInput;
