import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { toast } from "react-toastify";


const Signup = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");


  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
    password: "",
    cpassword: "",
    adminKey: "",
  });


  const handleInputs = (e) => {
    const { name, value } = e.target;

    setUser((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const postData = async (e) => {
    e.preventDefault();

    setAuthStatus("");
    setIsLoading(true);


    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/register`,
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          password: user.password,
          cpassword: user.cpassword,
          adminKey:
            user.userType === "admin"
              ? user.adminKey
              : undefined,
        }
      );


      toast.success("Account created successfully.");

      navigate("/login");

    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      const message =
        error.response?.data?.error ||
        "Unable to create account.";

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
        <section className="min-h-screen flex items-center justify-center bg-white px-4 py-10">

          <div className="w-full max-w-lg bg-white shadow-2xl shadow-blue-200 rounded-lg p-8">

            <h3 className="text-3xl mb-8 font-extrabold text-gray-900">
              Create your{" "}
              <span className="text-indigo-600">
                UrbanNest
              </span>{" "}
              account
            </h3>


            <form onSubmit={postData}>

              {/* Name */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Full Name
                </label>

                <input
                  required
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleInputs}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                />
              </div>


              {/* Email */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Email
                </label>

                <input
                  required
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputs}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                />
              </div>


              {/* Phone */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Phone
                </label>

                <input
                  required
                  type="tel"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputs}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                />
              </div>


              {/* Role */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Account Type
                </label>

                <select
                  required
                  name="userType"
                  value={user.userType}
                  onChange={handleInputs}
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select account type
                  </option>

                  <option value="buyer">
                    Buyer
                  </option>

                  <option value="seller">
                    Seller
                  </option>

                  {process.env.REACT_APP_ADMIN_SIGN_UP === "true" && (
                    <option value="admin">
                      Admin
                    </option>
                  )}
                </select>
              </div>


              {/* Admin key */}
              {user.userType === "admin" && (
                <div className="mb-4">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                    Admin Key
                  </label>

                  <input
                    required
                    type="password"
                    name="adminKey"
                    value={user.adminKey}
                    onChange={handleInputs}
                    placeholder="Admin key"
                    className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                  />
                </div>
              )}


              {/* Password */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Password
                </label>

                <input
                  required
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleInputs}
                  placeholder="Minimum 8 characters"
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                />
              </div>


              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                  Confirm Password
                </label>

                <input
                  required
                  type="password"
                  name="cpassword"
                  value={user.cpassword}
                  onChange={handleInputs}
                  placeholder="Confirm password"
                  className="w-full border border-gray-300 rounded py-2 px-3 outline-none focus:border-indigo-500"
                />
              </div>


              {authStatus && (
                <p className="text-red-600 font-semibold text-sm mb-4">
                  {authStatus}
                </p>
              )}


              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition"
              >
                Create Account
              </button>


              <p className="mt-5 text-center text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Login
                </Link>
              </p>

            </form>

          </div>

        </section>
      )}
    </>
  );
};


export default Signup;