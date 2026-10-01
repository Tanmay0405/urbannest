import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="text-gray-600 body-font mt-5 border-t">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900"
        >
          <div
            aria-label="UrbanNest Home"
            className="flex items-center"
            role="img"
          >
            <img
              className="w-24 md:w-32"
              src={logo}
              alt="UrbanNest logo"
            />
          </div>
        </Link>

        {/* Copyright */}
        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          © 2026 UrbanNest. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;