import { Link } from "react-router-dom";
import styles from "../../assets/styles/components/Logo.module.css";

const Logo = () => {
  return (
    <p className={styles.formLogo}>
      <Link to={"/"}>
        <b>PrimeMarket</b>.com
      </Link>
    </p>
  );
};

export default Logo;
