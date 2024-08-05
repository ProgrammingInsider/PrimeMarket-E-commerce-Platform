import { useEffect, useState, useReducer } from "react";
import styles from "../../assets/styles/components/Rating.module.css";
import ProductRate from "./ProductRate";
import { GoStarFill } from "react-icons/go";
import { getRate } from "../../services/cartServices";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useGlobalContext } from "../../context/ContextAPI";
import UserProfileLink from "./UserProfileLink";
import CircleLoader from "./CircleLoader";
import { ratesReducer } from "../../reducer/ratesReducer";

const Rating = ({ ratingCount, averageRating, productid }) => {
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userComments, dispatch] = useReducer(ratesReducer, []);
  const [userRateQuantity, setUserRateQuantity] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [commentError, setErrorComment] = useState("");
  const [textarea, setTextarea] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { auth, showDialogBox } = useGlobalContext();

  const handleMouseEnter = (index) => setHoveredStar(index);
  const handleMouseLeave = () => setHoveredStar(0);
  const handleClick = (index) => {
    setRating(index);
    setTextarea(true);
  };

  useEffect(() => {
    const getUserRate = async () => {
      try {
        const { length, result } = await getRate(productid);

        setUserRateQuantity(length);
        dispatch({ type: "FETCH", comments: result });
      } catch (error) {
        console.log("Something went wrong please refresh the page");
      }
    };

    userComments.length > 0 || getUserRate();
  }, [productid]);

  const handleRate = async () => {
    if (!auth?.userId) {
      showDialogBox(true, "warning", "Please Login First");
      return;
    }

    if (!comment || !rating) {
      setErrorComment("Leave the comment");
    } else {
      const rateBody = {
        productId: productid,
        rating: rating,
        comment: comment,
      };

      try {
        setLoading(true);
        const { data } = await axiosPrivate.post(`/rateproduct`, rateBody);

        const { message, user } = await data;

        showDialogBox(true, "success", message);
        setComment("");
        setTextarea(false);
        setRating(0);
        dispatch({
          type: "UPDATE",
          id: user._id,
          addComment: { ...rateBody, user },
        });
      } catch (error) {
        if (error.response?.status === 400) {
          showDialogBox(true, "error", error.response.data.message);
        } else {
          showDialogBox(true, "error", "Something went wrong try again later");
        }
      } finally {
        setLoading(false);
      }

      setErrorComment("");
    }
  };

  return (
    <section className={`${styles.ratingSection} section`}>
      <div className="sectionHeader">
        <h1 className={styles.sectionTitle}>Rating and reviews</h1>
      </div>

      <div className={styles.ratingContainer}>
        <p className={styles.ratingDescription}>
          Rating and reviews are verified and are from people who use the same
          type of device that you use.
        </p>
        <div className={styles.ratingStatics}>
          <div className={styles.ratingCount}>
            <h1 className={styles.averageCount}>{averageRating}</h1>
            <ProductRate
              averageRating={averageRating}
              ratingCount={ratingCount}
              displayColumn={true}
              size={"large"}
            />
          </div>
          <div className={styles.ratingBarsContainer}>
            <div className={styles.ratingBars}>
              5{" "}
              <span className={styles.barBackground}>
                <span className={`${styles.bar} ${styles.fiveStarBar}`}></span>
              </span>
            </div>
            <div className={styles.ratingBars}>
              4{" "}
              <span className={styles.barBackground}>
                <span className={`${styles.bar} ${styles.fourStarBar}`}></span>
              </span>
            </div>
            <div className={styles.ratingBars}>
              3{" "}
              <span className={styles.barBackground}>
                <span className={`${styles.bar} ${styles.threeStarBar}`}></span>
              </span>
            </div>
            <div className={styles.ratingBars}>
              2{" "}
              <span className={styles.barBackground}>
                <span className={`${styles.bar} ${styles.twoStarBar}`}></span>
              </span>
            </div>
            <div className={styles.ratingBars}>
              1{" "}
              <span className={styles.barBackground}>
                <span className={`${styles.bar} ${styles.oneStarBar}`}></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.commentSection}>
        <div className={styles.starsContainer}>
          <span className={styles.rateProductText}>Rate Product Here: </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <GoStarFill
              className={`${styles.star} ${hoveredStar >= star ? styles.filled : ""} ${rating >= star ? styles.filled : ""}`}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(star)}
              title={`Rate product ${star}/5`}
              key={star}
              data-cy={`rate ${star}`}
            />
          ))}
        </div>

        {textarea && (
          <>
            <textarea
              className={styles.commentInput}
              placeholder="Write your comment here..."
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            {commentError && (
              <p className={styles.commentError}>{commentError}</p>
            )}
            <button className={styles.rateSubmitBtn} onClick={handleRate}>
              {loading ? <CircleLoader /> : "Submit"}
            </button>
          </>
        )}
      </div>

      {userComments.length > 0 ? (
        userComments.map((comment) => {
          const { user, _id } = comment;
          return (
            <div key={_id} className={styles.productCommentContainer}>
              <UserProfileLink user={user} />
              <div className={styles.productRating}>
                <ProductRate
                  averageRating={comment.rating}
                  showNumberofReviews={false}
                />
                <p className={styles.commentDate}>
                  {comment.updatedAt.split("T")[0]}
                </p>
              </div>
              <p className={styles.comment}>{comment.comment}</p>
            </div>
          );
        })
      ) : (
        <h1 className="notFoundText">No Product Rate Found</h1>
      )}
    </section>
  );
};

export default Rating;
