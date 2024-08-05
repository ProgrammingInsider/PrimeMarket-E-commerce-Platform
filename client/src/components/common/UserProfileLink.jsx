import React from "react";
import styles from "../../assets/styles/components/UserProfileLink.module.css";
import { Link } from "react-router-dom";

const UserProfileLink = ({ user, postedBy = false }) => {
  return (
    <Link to={`/profile/${user._id}`}>
      <div className={styles.userContainer}>
        <div className={styles.userImageContainer}>
          {user.profilePic !== "null" && user?.profilePic !== null ? (
            <img src={user.profilePic} alt={`${user.firstname} User Image`} />
          ) : (
            <h1 className="profilePicPlaceholder">
              {user.firstname.slice(0, 1)}
              {user.lastname.slice(0, 1)}
            </h1>
          )}
        </div>
        <div className={styles.usernameContainer}>
          {postedBy && <p>Posted By</p>}
          <h1 className={styles.username}>
            <span>{user.firstname}</span>
            <span>{user.lastname}</span>
          </h1>
        </div>
      </div>
    </Link>
  );
};

export default UserProfileLink;
