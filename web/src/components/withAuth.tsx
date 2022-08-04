import React from "react";
import {useSelector} from "react-redux";
import {useRouter} from "next/router";
import {isAuthenticatedSelector, isAuthenticatingSelector} from "../store/slices/userSlice";

export const isClient = () => typeof window !== "undefined";

const withAuth = (WrappedComponent: React.FC) => (props: any) => {
  // this hoc only supports client side rendering.
  if (isClient()) {
    const router = useRouter();
    const {route} = router;
    const isAuthenticated = useSelector(isAuthenticatedSelector);
    const isAuthenticating = useSelector(isAuthenticatingSelector);

    // is fetching session (eg. show spinner)
    if (isAuthenticating) {
      return null;
    }

    // // If user is not logged in, return signin component
    if (route !== "/login" && route !== "/register") {
      if (!isAuthenticated) {
        router.push(`pages/login`);

        return null;
      } else if (route !== "/") {
        router.push(`/`);

        return null;
      }
    } else {
      if (isAuthenticated) {
        router.push(`/`);

        return null;
      }
    }

    // If user is logged in, return original component
    return <WrappedComponent {...props} />;
  }

  return null;
};

export default withAuth;
