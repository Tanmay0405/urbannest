import React, {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  UserContext,
} from "../../App";

import LoadingSpinner from "../LoadingSpinner";

import {
  toast,
} from "react-toastify";


const Login = () => {
  const { dispatch } = useContext(UserContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [authStatus, setAuthStatus] = useState("");


  const loginUser = async (e) => {
    e.preventDefault();

    setAuthStatus("");
    setIsLoading(true);


    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/login`,
        {
          email,
          password,
        }
      );


      const {
        token,
        userLogin,
      } = response.data;


      const userType =
        userLogin.userType.toLowerCase();


      // Store authentication information
      localStorage.setItem(
        "jwtoken",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(userLogin)
      );

      localStorage.setItem(
        "userId",
        userLogin._id
      );

      localStorage.setItem(
        "userType",
        userType
      );

      localStorage.setItem(
        "userEmail",
        userLogin.email
      );


      // Update global state
      dispatch({
        type: "USER",
        payload: userLogin,
      });

      dispatch({
        type: "USER_TYPE",
        payload: userType,
      });


      toast.success("Login successful.");

      navigate("/dashboard");

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error.response?.data?.error ||
        "Unable to login.";

      setAuthStatus(message);

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <section className="min-h-screen flex items-center justify-center px-4">

          <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-sm">

            <h2 className="text-2xl mb-6 font-bold">
              Sign In
            </h2>


            <form onSubmit={loginUser}>

              <input
                required
                type="email"
                placeholder="Email"
                className="border p-3 mb-4 w-full rounded"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />


              <input
                required
                type="password"
                placeholder="Password"
                className="border p-3 mb-4 w-full rounded"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />


              {authStatus && (
                <p className="text-red-500 text-sm mb-3">
                  {authStatus}
                </p>
              )}


              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-3 rounded w-full font-semibold hover:bg-indigo-700"
              >
                Login
              </button>

            </form>


            <p className="mt-5 text-sm">
              Don't have an account?{" "}

              <Link
                to="/signup"
                className="text-blue-600 font-semibold"
              >
                Signup
              </Link>
            </p>

          </div>

        </section>
      )}
    </>
  );
};


export default Login;