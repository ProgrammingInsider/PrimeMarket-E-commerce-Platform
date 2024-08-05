import React from "react";
import styles from "../../assets/styles/components/Footer.module.css";
import Logo from "../common/Logo";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../../context/ContextAPI";

// Icons
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { FaLinkedinIn } from "react-icons/fa";

// Images
import visa from "../../assets/images/visa.png";
import mastercard from "../../assets/images/mastercard.png";
import paypal from "../../assets/images/paypal.png";

const Footer = () => {
  const { auth } = useGlobalContext();
  return (
    <footer className={styles.footer}>
      <div className={`section ${styles.footerContainer}`}>
        <div className={`${styles.footerSection} ${styles.aboutUsSection}`}>
          <Logo className={styles.footerLogo} />
          <h4>About Us</h4>
          <p>
            Prime Market provides top-quality products, from tech gadgets to
            stylish apparel, with a focus on exceptional value and customer
            service. Shop confidently with us!
          </p>
          <p>Contact: info@example.com | +1 123 456 7890</p>
        </div>

        <div className={styles.footerSection}>
          <h4>Navigation</h4>
          <ul className={styles.footerList}>
            <Link to={"/"}>
              <li>Home</li>
            </Link>
            <Link to={""}>
              <li>Shop</li>
            </Link>
            <Link to={"/"}>
              <li>About Us</li>
            </Link>
            <Link to={"/"}>
              <li>Contact Us</li>
            </Link>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Customer Service</h4>
          <ul className={styles.footerList}>
            <Link to={""}>
              <li>FAQ</li>
            </Link>
            <Link to={""}>
              <li>Shipping & Returns</li>
            </Link>
            <Link to={""}>
              <li>Privacy Policy</li>
            </Link>
            <Link to={""}>
              <li>Terms of Service</li>
            </Link>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Account</h4>
          <ul className={styles.footerList}>
            {auth?.userId ? (
              <Link to={`/profile/${auth.userId}`}>
                <li>My Account</li>
              </Link>
            ) : (
              <Link to={`/signin`}>
                <li>Sign In</li>
              </Link>
            )}
            <Link to={"/cart"}>
              <li>Cart</li>
            </Link>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Follow Us</h4>
          <ul className={styles.socialMediaList}>
            <li>
              <a href="#">
                <FaFacebookF className={styles.Icon} /> Facebook
              </a>
            </li>
            <li>
              <a href="#">
                <BsTwitterX className={styles.Icon} /> Twitter
              </a>
            </li>
            <li>
              <a href="#">
                <FaInstagram className={styles.Icon} /> Instagram
              </a>
            </li>
            <li>
              <a href="#">
                <FaLinkedinIn className={styles.Icon} /> LinkedIn
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Newsletter</h4>
          <form>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe
            </button>
          </form>
        </div>

        <div className={styles.footerSection}>
          <h4>Payment Methods</h4>
          <div className={styles.paymentMethodContainer}>
            <img src={visa} alt="Visa" className={styles.paymentMethod} />
            <img
              src={mastercard}
              alt="MasterCard"
              className={styles.paymentMethod}
            />
            <img src={paypal} alt="PayPal" className={styles.paymentMethod} />
          </div>
        </div>

        <div className={styles.footerSection}>
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
