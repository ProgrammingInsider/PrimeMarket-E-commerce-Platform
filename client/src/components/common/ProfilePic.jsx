import { useState, memo } from "react";
import styles from "../../assets/styles/components/ProfilePic.module.css";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useGlobalContext } from "../../context/ContextAPI";
// Assets
import CircleLoader from "./CircleLoader";

const ProfilePic = ({ userInfo, setUserInfo, role }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { showDialogBox } = useGlobalContext();
  const axiosPrivate = useAxiosPrivate();

  const profilePicFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("oldPublicId", userInfo?.profilePublicId);

    try {
      setLoading(true);
      const { data } = await axiosPrivate.put(
        "/updateprofilepicfromcloudinary",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const { message, url, publicId } = data;
      setUserInfo({ ...userInfo, profilePic: url, profilePublicId: publicId });
      showDialogBox(true, "success", message);
    } catch (error) {
      if (error.response?.status === 400) {
        showDialogBox(true, "error", error.response.data.message);
      } else {
        showDialogBox(true, "error", "Something went wrong, try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicDelete = async () => {
    const result = confirm(
      "Are you sure you want to delete the Profile Picture Image?",
    );
    if (result) {
      try {
        setLoading(true);

        const { data } = await axiosPrivate.delete(
          "/deleteprofilepicfromcloudinary",
          {
            data: {
              publicId: userInfo?.profilePublicId,
            },
          },
        );
        const { message } = data;
        setUserInfo({ ...userInfo, profilePic: null, profilePublicId: "null" });
        showDialogBox(true, "success", message);
      } catch (error) {
        if (error.response?.status === 400) {
          showDialogBox(true, "error", error.response.data.message);
        } else {
          showDialogBox(true, "error", "Something went wrong, try again later");
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log("User clicked Cancel");
    }
    setShowOptions(false);
  };

  return (
    <div className={styles.profilePicContainer}>
      {loading && <CircleLoader size={60} />}

      {userInfo?.profilePic !== "null" && userInfo?.profilePic !== null ? (
        <img
          src={userInfo.profilePic}
          alt="Profile Pic"
          className={styles.profilePic}
        />
      ) : (
        <h1 className={styles.profilePicPlaceholder}>
          <span className={styles.firstname}>{userInfo.firstname[0]}</span>
          <span className={styles.lastname}>{userInfo.lastname[0]}</span>
        </h1>
      )}

      {role === 112208 && (
        <>
          <div
            className={styles.iconContainer}
            data-testid="profilePicadminicons"
          >
            <div>
              <MdDelete
                className={`${styles.profilePicIcon} ${styles.deleteBanner}`}
                onClick={handleProfilePicDelete}
                data-testid="deleteprofileicon"
              />
            </div>
            <div>
              <label htmlFor="profilePicture" data-testid="editprofileicon">
                <FaEdit
                  className={`${styles.profilePicIcon} ${styles.editBanner}`}
                />
              </label>
              <input
                type="file"
                id="profilePicture"
                onChange={profilePicFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(ProfilePic);
