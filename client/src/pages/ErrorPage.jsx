import React from "react";
import styles from "../assets/styles/Pages/ErrorPage.module.css";

const ErrorPage = ({ message, serverError = false }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.imageContainer}>
        <div className={styles.image}></div>
        <h1 className={styles.textOverlay}>Oops!</h1>
      </div>
      <h1 className={styles.errorTitle}>
        {serverError
          ? message || "Something went wrong, please try again!"
          : message || "404 - Page Not Found"}
      </h1>

      {serverError || (
        <p className={styles.errorMessage}>
          Oops! The {message || "Page Not Found"} you're looking for doesn't
          exist. It might have been moved or deleted.
        </p>
      )}
      <a href="/" className={styles.homeButton}>
        Go Back Home
      </a>
    </div>
  );
};

export default ErrorPage;
