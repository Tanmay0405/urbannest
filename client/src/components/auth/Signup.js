import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/register`, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        password: user.password,
        cpassword: user.cpassword,
        adminKey: user.userType === "admin" ? user.adminKey : undefined,
      });

      toast.success("Account created successfully.");

      navigate("/login");
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      const message =
        error.response?.data?.error || "Unable to create account.";

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
            {/* Visual Panel */}
            <section className="relative hidden overflow-hidden lg:block">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85')",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/65 to-slate-950/40" />

              <div className="relative z-10 flex h-full min-h-[760px] flex-col justify-end p-12 xl:p-16">
                <div className="max-w-xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-indigo-300" />

                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                      UrbanNest
                    </span>
                  </div>

                  <h2 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                    Your next chapter
                    <span className="block text-indigo-300">starts here.</span>
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-7 text-indigo-50/90">
                    Create your UrbanNest account and start exploring properties
                    that match your lifestyle, location, and needs.
                  </p>

                  <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Explore</p>

                      <p className="mt-1 text-xs text-indigo-100">Properties</p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Save</p>

                      <p className="mt-1 text-xs text-indigo-100">Favorites</p>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-lg font-bold text-white">Connect</p>

                      <p className="mt-1 text-xs text-indigo-100">
                        With sellers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Signup Form */}
            <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
              <div className="w-full max-w-lg">
                <div className="mb-7">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Get started
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Create your UrbanNest account
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    Join UrbanNest and start discovering properties or listing
                    your own.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
                  <form onSubmit={postData} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="signup-name"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Full name
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
                              d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                            />
                          </svg>
                        </span>

                        <input
                          id="signup-name"
                          required
                          type="text"
                          name="name"
                          value={user.name}
                          onChange={handleInputs}
                          placeholder="Your full name"
                          autoComplete="name"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="signup-email"
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
                          id="signup-email"
                          required
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleInputs}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    </div>

                    {/* Phone + Role */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="signup-phone"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Phone number
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
                                d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h2.25a1.5 1.5 0 0 1 1.46 1.15l.75 3a1.5 1.5 0 0 1-.42 1.4l-1.5 1.5a12.04 12.04 0 0 0 5.41 5.41l1.5-1.5a1.5 1.5 0 0 1 1.4-.42l3 .75a1.5 1.5 0 0 1 1.15 1.46v2.25a2.25 2.25 0 0 1-2.25 2.25h-.75C9.55 21.75 2.25 14.45 2.25 5.5v1.25Z"
                              />
                            </svg>
                          </span>

                          <input
                            id="signup-phone"
                            required
                            type="tel"
                            name="phone"
                            value={user.phone}
                            onChange={handleInputs}
                            placeholder="10-digit number"
                            maxLength="10"
                            autoComplete="tel"
                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="signup-user-type"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Account type
                        </label>

                        <select
                          id="signup-user-type"
                          required
                          name="userType"
                          value={user.userType}
                          onChange={handleInputs}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="">Select type</option>

                          <option value="buyer">Buyer</option>

                          <option value="seller">Seller</option>

                          {process.env.REACT_APP_ADMIN_SIGN_UP === "true" && (
                            <option value="admin">Admin</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Admin Key */}
                    {user.userType === "admin" && (
                      <div>
                        <label
                          htmlFor="signup-admin-key"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Admin key
                        </label>

                        <input
                          id="signup-admin-key"
                          required
                          type="password"
                          name="adminKey"
                          value={user.adminKey}
                          onChange={handleInputs}
                          placeholder="Enter admin key"
                          autoComplete="off"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    )}

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="signup-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Password
                      </label>

                      <div className="relative">
                        <input
                          id="signup-password"
                          required
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={user.password}
                          onChange={handleInputs}
                          placeholder="Minimum 8 characters"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="signup-confirm-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Confirm password
                      </label>

                      <div className="relative">
                        <input
                          id="signup-confirm-password"
                          required
                          type={showConfirmPassword ? "text" : "password"}
                          name="cpassword"
                          value={user.cpassword}
                          onChange={handleInputs}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
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
                                d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12s3.75 6.75 9.75 6.75a9.75 9.75 0 0 0 5.77-1.895M6.228 6.228C7.77 5.3 9.65 4.75 12 4.75m0 0c6 0 9.75 6.75 9.75 6.75a10.54 10.54 0 0 1-2.012 2.855M6.228 6.228 3 3m3.228 3.228 4.547 4.547m0 0a3 3 0 1 0 4.243 4.243M10.775 10.775 14.5 14.5m0 0L21 21"
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
                      Create Account
                    </button>
                  </form>

                  {/* Login */}
                  <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm text-slate-500">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-bold text-indigo-600 transition hover:text-indigo-700"
                      >
                        Sign in
                      </Link>
                    </p>
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

export default Signup;
