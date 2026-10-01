import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  UserContext,
} from "../../App";

import {
  toast,
} from "react-toastify";

import LoadingSpinner from "../LoadingSpinner";


const Logout = () => {
  const { dispatch } = useContext(UserContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] =
    useState(true);


  useEffect(() => {
    const logoutUser = async () => {
      try {

        const token =
          localStorage.getItem("jwtoken");


        if (token) {
          await axios.get(
            `${process.env.REACT_APP_SERVER_URL}/logout`
          );
        }

      } catch (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );

      } finally {

        // Clear React state
        dispatch({
          type: "USER",
          payload: null,
        });

        dispatch({
          type: "USER_TYPE",
          payload: null,
        });


        // Clear ALL local authentication state
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("userType");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("jwtoken");


        setIsLoading(false);


        toast.success(
          "Logout successful.",
          {
            toastId: "logout",
          }
        );


        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }
    };


    logoutUser();

  }, [dispatch, navigate]);


  return (
    <>
      {isLoading && (
        <LoadingSpinner />
      )}
    </>
  );
};


export default Logout;