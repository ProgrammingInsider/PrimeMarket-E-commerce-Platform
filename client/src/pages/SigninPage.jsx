import { useEffect } from "react";
import Signin from "../components/common/Signin";
import QuickSignIn from "../components/layout/QuickSignIn";

const SigninPage = () => {
  useEffect(() => {
    document.title = `Signin - primemarket.com`;
  }, []);

  return (
    <>
      <main style={{ position: "relative" }}>
        <QuickSignIn />
        <Signin />
      </main>
    </>
  );
};

export default SigninPage;
