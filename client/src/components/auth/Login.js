import React, { useContext, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import { UserContext } from "../../App";

import LoadingSpinner from "../LoadingSpinner";

import { toast } from "react-toastify";

const Login = () => {
  const { dispatch } = useContext(UserContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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
        },
      );

      const { token, userLogin } = response.data;

      const userType = userLogin.userType.toLowerCase();

      // Store authentication information
      localStorage.setItem("jwtoken", token);

      localStorage.setItem("user", JSON.stringify(userLogin));

      localStorage.setItem("userId", userLogin._id);

      localStorage.setItem("userType", userType);

      localStorage.setItem("userEmail", userLogin.email);

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

      const message = error.response?.data?.error || "Unable to login.";

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
        <main className="min-h-[calc(100vh-76px)] bg-slate-50">
          <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl grid-cols-1 lg:grid-cols-2">
            {/* Login Form */}
            <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
              <div className="w-full max-w-md">
                <div className="mb-8">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Welcome back
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Sign in to UrbanNest
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
                    Access your UrbanNest account and continue exploring
                    properties that feel like home.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
                  <form onSubmit={loginUser} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="login-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email address
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.69 5.423a2.25 2.25 0 0 1-2.37 0L2.25 6.75"
                            />
                          </svg>
                        </span>

                        <input
                          id="login-email"
                          required
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="login-password"
                          className="block text-sm font-semibold text-slate-700"
                        >
                          Password
                        </label>
                      </div>

                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 10.5V7.125a4.5 4.5 0 0 0-9 0V10.5m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v6A2.25 2.25 0 0 1 17.25 21h-10.5a2.25 2.25 0 0 1-2.25-2.25v-6A2.25 2.25 0 0 1 6.75 10.5Z"
                            />
                          </svg>
                        </span>

                        <input
                          id="login-password"
                          required
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12s3.75 6.75 9.75 6.75a9.75 9.75 0 0 0 5.77-1.895M6.228 6.228C7.77 5.3 9.65 4.75 12 4.75c6 0 9.75 6.75 9.75 6.75a10.54 10.54 0 0 1-2.012 2.855M6.228 6.228 3 3m3.228 3.228 4.547 4.547m0 0a3 3 0 1 0 4.243 4.243M10.775 10.775 14.5 14.5m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
                              />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {authStatus && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" d="M12 8v4" />
                            <path strokeLinecap="round" d="M12 16h.01" />
                          </svg>

                          <p className="text-sm leading-5 text-red-700">
                            {authStatus}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Sign In
                    </button>
                  </form>

                  {/* Signup */}
                  <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm text-slate-500">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="font-bold text-indigo-600 transition hover:text-indigo-700"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Visual Panel */}
            <section className="relative hidden overflow-hidden lg:block">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85')",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/65 to-slate-950/40" />

              <div className="relative z-10 flex h-full min-h-[700px] flex-col justify-end p-12 xl:p-16">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-indigo-300" />

                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                      UrbanNest
                    </span>
                  </div>

                  <h2 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                    Find a place that
                    <span className="block text-indigo-300">
                      feels like home.
                    </span>
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-7 text-indigo-50/90">
                    Explore properties, discover new possibilities, and find a
                    space that fits the way you want to live.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Explore</p>
                      <p className="mt-1 text-xs text-indigo-100">Properties</p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Connect</p>
                      <p className="mt-1 text-xs text-indigo-100">
                        With sellers
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Discover</p>
                      <p className="mt-1 text-xs text-indigo-100">
                        Your next home
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}
    </>
  );
};

export default Login;
