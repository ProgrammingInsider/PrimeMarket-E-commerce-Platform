import styles from "../assets/styles/Pages/UserPage.module.css";
import Banner from "../components/common/Banner";
import ProfilePic from "../components/common/ProfilePic";
import { useGlobalContext } from "../context/ContextAPI";
import { IoCopy } from "react-icons/io5";
import { Link, useParams } from "react-router-dom";
import { useState, useReducer, useEffect } from "react";
import ProductCardDisplay from "../components/common/ProductCardDisplay";
import { productsReducer } from "../reducer/productsReducer";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import ErrorPage from "./ErrorPage";
import CircleLoader from "../components/common/CircleLoader";

const UserPage = () => {
  const [active, setActive] = useState(0);
  const [products, dispatch] = useReducer(productsReducer, []);
  const [userRole, setUserRole] = useState();
  const [serverError, setServerError] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [productQuantity, setProductQuantity] = useState(0);
  const { auth, showDialogBox } = useGlobalContext();
  const { profileid } = useParams();
  const [message, setMessage] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (userInfo.firstname !== undefined) {
      document.title = `${userInfo?.firstname} ${userInfo?.lastname} - primemarket.com`;
    }
  }, [userInfo]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setUserLoading(true);
        const { data } = await axiosPrivate.get(`/userprofile/${profileid}`);

        const { productQuantity, products, user } = await data;

        dispatch({ type: "FETCH", products: products });
        setUserInfo(user);
        setProductQuantity(productQuantity);
      } catch (error) {
        if (error.response?.status === 400) {
          setMessage("User Not Found");
        } else {
          setServerError(true);
          setMessage("Something went wrong try again later");
        }
      } finally {
        setUserLoading(false);
      }
    };

    products.length > 0 || fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profileid === auth.userId) {
      setUserRole(112208);
    }
  }, [auth]);

  const deleteProduct = async (publicId, setLoading) => {
    try {
      setLoading(true);
      const { data } = await axiosPrivate.delete(
        "/deleteproductfromcloudinary",
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
          data: {
            publicId: publicId,
          },
        },
      );

      const { message } = await data;

      dispatch({ type: "REMOVE", publicId: publicId });
      setProductQuantity((productQuantity) => productQuantity - 1);
      showDialogBox(true, "success", message);
    } catch (error) {
      if (error.response?.status === 400) {
        showDialogBox(true, "error", error.response.data.message);
      } else {
        showDialogBox(true, "error", "Something went wrong try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  // Condition Render
  if (
    (!userInfo || Object.keys(userInfo).length === 0) &&
    userLoading === false
  ) {
    return <ErrorPage message={message} serverError={serverError} />;
  }

  const { address, _id, firstname, lastname } = userInfo;

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showDialogBox(true, "success", "Copied to clipboard");
      })
      .catch((err) => {
        showDialogBox(true, "error", "Failed to copy try again later");
      });
  };

  return (
    <>
      <section style={{ minHeight: "70vh", position: "relative" }}>
        {userLoading ? (
          <CircleLoader />
        ) : (
          <>
            <section className={styles.userHeader}>
              <Banner
                className={styles.userBanner}
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                role={userRole}
              />
              <section className={styles.userInformationContainer}>
                <div className={styles.profilePicWrapper}>
                  <ProfilePic
                    className={styles.userProfilePic}
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    role={userRole}
                  />
                </div>
                <div className={styles.userInformation}>
                  <h1 className={styles.username}>
                    <span className={styles.firstname}>{firstname}</span>
                    <span className={styles.lastname}>{lastname}</span>
                  </h1>
                  <p className={styles.copyUserId}>
                    Id:&nbsp;{_id}
                    <IoCopy
                      className={styles.copyToClipboard}
                      title="Copy"
                      onClick={() =>
                        copyToClipboard(`http://localhost:5173/profile/${_id}`)
                      }
                    />
                  </p>
                  <p className={styles.location}>
                    <span className={styles.city}>{address?.city}</span>,&nbsp;
                    <span className={styles.country}>{address?.country}</span>
                  </p>

                  {userRole === 112208 && (
                    <div className={styles.btnContainer}>
                      <Link to={"/postproduct"}>
                        <button
                          className={`${styles.userBtn} ${styles.createProductBtn}`}
                        >
                          Create Product
                        </button>
                      </Link>
                      <Link to={"/updateuser"}>
                        <button
                          className={`${styles.userBtn} ${styles.editBtn}`}
                        >
                          Edit Profile
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </section>
            <section className="mainSection1">
              <section className={`${styles.productSection} section`}>
                <div className={styles.sectionHeader}>
                  <ul className={styles.sectionNav}>
                    <li
                      onClick={() => setActive(0)}
                      className={
                        active === 0
                          ? `${styles.activeSectionLink} ${styles.sectionLink}`
                          : `${styles.sectionLink}`
                      }
                    >
                      Products ({productQuantity})
                    </li>
                  </ul>
                </div>
                {active === 0 && (
                  <ProductCardDisplay
                    products={products}
                    role={userRole}
                    deleteProduct={deleteProduct}
                    grid={""}
                  />
                )}
              </section>
            </section>
          </>
        )}
      </section>
    </>
  );
};

export default UserPage;
