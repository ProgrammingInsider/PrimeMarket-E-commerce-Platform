import { memo, useState } from "react";
import styles from "../../assets/styles/components/Banner.module.css";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useGlobalContext } from "../../context/ContextAPI";
import CircleLoader from "./CircleLoader";

const Banner = ({ userInfo, setUserInfo, role }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { showDialogBox } = useGlobalContext();
  const axiosPrivate = useAxiosPrivate();

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("bannerPic", selectedFile);
    formData.append("oldPublicId", userInfo?.bannerPublicId);

    try {
      setLoading(true);
      const { data } = await axiosPrivate.put(
        "/updatebannerfromcloudinary",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const { message, url, publicId } = data;
      showDialogBox(true, "success", message);

      setUserInfo({ ...userInfo, bannerPic: url, bannerPublicId: publicId });
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

  const handleBannerDelete = async () => {
    const result = confirm("Are you sure you want to delete the Banner Image?");
    if (result) {
      try {
        setLoading(true);

        const { data } = await axiosPrivate.delete(
          "/deletebannerfromcloudinary",
          {
            data: {
              publicId: userInfo?.bannerPublicId,
            },
          },
        );
        const { message } = await data;
        setUserInfo({ ...userInfo, bannerPic: null, bannerPublicId: "null" });
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
    <div className={styles.bannerContainer}>
      {loading && <CircleLoader size={60} />}
      <div className={styles.banner}>
        {userInfo?.bannerPic ? (
          <img
            src={userInfo.bannerPic}
            className={styles.bannerImage}
            alt="Banner"
          />
        ) : (
          <span className={styles.bannerPlaceholder}></span>
        )}
        {role === 112208 && (
          <>
            <div
              className={styles.iconContainer}
              data-testid="banneradminicons"
            >
              <div>
                <MdDelete
                  className={`${styles.bannerIcon} ${styles.deleteBanner}`}
                  onClick={handleBannerDelete}
                  data-testid="deletebannericon"
                />
              </div>
              <div>
                <label
                  htmlFor="bannerPictureInput"
                  data-testid="editbannericon"
                >
                  <FaEdit
                    className={`${styles.bannerIcon} ${styles.editBanner}`}
                  />
                </label>
                <input
                  type="file"
                  id="bannerPictureInput"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(Banner);
