import { useEffect } from "react";
import { useGlobalContext } from "../../context/ContextAPI";

const Alert = () => {
  const { alertVisibility, alertType, alertMessage, showDialogBox } =
    useGlobalContext();

  useEffect(() => {
    if (alertVisibility) {
      var setTimeOut = setTimeout(() => {
        showDialogBox(false, "", "");
      }, 5000);
    }

    return () => clearTimeout(setTimeOut);
  }, [alertVisibility]);

  return (
    <div
      className={`${alertVisibility ? "showAlert" : "hideAlert"} alert ${alertType}`}
      data-testid="alert"
    >
      <div>{alertMessage}</div>
    </div>
  );
};

export default Alert;
