import React, { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import CircleLoader from "../components/common/CircleLoader";
// Lazy load the layouts and pages
const RootLayout = lazy(() => import("./RootLayout"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const RouteWithHeader = lazy(() => import("./RouteWithHeader"));
const PersistLogin = lazy(() => import("./PersistLogin"));
const HomePage = lazy(() => import("../pages/HomePage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const PostProductPage = lazy(() => import("../pages/PostProductPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const SigninPage = lazy(() => import("../pages/SigninPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const UpdateUserPage = lazy(() => import("../pages/UpdateUserPage"));
const UserPage = lazy(() => import("../pages/UserPage"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />} path="/">
      <Route path="signin" element={<SigninPage />} />
      <Route path="signup" element={<SignupPage />} />

      <Route element={<PersistLogin />}>
        <Route element={<RouteWithHeader />}>
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="product/:productid" element={<ProductDetailPage />} />
          <Route path="profile/:profileid" element={<UserPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="postproduct" element={<PostProductPage />} />
            <Route
              path="updateproduct/:productid"
              element={<PostProductPage />}
            />
            <Route path="updateuser" element={<UpdateUserPage />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Route>
    </Route>,
  ),
);

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div style={{ width: "100vw", height: "100vh" }}>
          <CircleLoader size={60} />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRoutes;
