import { useEffect } from "react";

// COMPONENTS
import Signup from "../components/common/Signup";
import QuickSignIn from "../components/layout/QuickSignIn";

const SignupPage = () => {
  useEffect(() => {
    document.title = `Signup - primemarket.com`;
  }, []);

  return (
    <>
      <main style={{ position: "relative" }}>
        <QuickSignIn />
        <Signup />
      </main>
    </>
  );
};

export default SignupPage;
