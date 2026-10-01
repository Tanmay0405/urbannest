import "./App.css";
import { Routes, Route } from "react-router-dom";
import { createContext, useReducer, useEffect } from "react";

import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./components/Home";

import Signup from "./components/auth/Signup";
import Logout from "./components/auth/Logout";
import Login from "./components/auth/Login";

// Property components
import PropertyDetails from "./components/properties/PropertyDetails";
import PropertyForm from "./components/properties/PropertyForm";

import ErrorPage from "./components/ErrorPage";
import Unauthorized from "./components/Unauthorized";
import PropertyListing from "./components/properties/PropertyListing";
import SellerDashboard from "./components/dashboard/SellerDashboard";
import BuyerDashboard from "./components/dashboard/BuyerDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";

import { initialState, reducer } from "./reducer/UseReducer";

import Footer from "./components/Footer";

import PasswordReset from "./components/auth/PasswordReset";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifySuccess from "./components/auth/VerifySuccess";

import { CalendarView } from "./components/CalendarView";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const UserContext = createContext();

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const type = localStorage.getItem("userType");

    if (type) {
      dispatch({
        type: "USER_TYPE",
        payload: type,
      });
    }
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((request) => {
      const token = localStorage.getItem("jwtoken");

      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }

      return request;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <>
      <UserContext.Provider value={{ state, dispatch }}>
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />

          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/property/:id" element={<PropertyDetails />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/login" element={<Login />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="/passwordReset" element={<PasswordReset />} />

          <Route
            path="/forgotPassword/:id/:token"
            element={<ForgotPassword />}
          />

          <Route path="/verifyEmail/:id/:token" element={<VerifySuccess />} />

          {/* General */}
          <Route
            path="/profile"
            element={<div style={{ padding: "40px" }}>Profile Page</div>}
          />

          <Route path="/calendar" element={<CalendarView />} />

          {/* UrbanNest Dashboard */}
          <Route
            path="/dashboard"
            element={
              state.userType === "seller" ? (
                <SellerDashboard />
              ) : state.userType === "buyer" ? (
                <BuyerDashboard />
              ) : state.userType === "admin" ? (
                <AdminDashboard />
              ) : (
                <Unauthorized />
              )
            }
          />

          {/* Seller property creation */}
          <Route
            path="/property/new"
            element={
              state.userType === "seller" ? <PropertyForm /> : <Unauthorized />
            }
          />

          {/* Seller property editing */}
          <Route
            path="/property/edit/:id"
            element={
              state.userType === "seller" ? <PropertyForm /> : <Unauthorized />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>

        <Footer />
      </UserContext.Provider>

      <ToastContainer position="bottom-left" autoClose={3000} theme="light" />
    </>
  );
};

export default App;
