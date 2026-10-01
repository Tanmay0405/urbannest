import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const userType = state.userType || localStorage.getItem("userType");

  const token = localStorage.getItem("jwtoken");

  const isLoggedIn = Boolean(state.user && token);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      if (token) {
        await axios.get(`${process.env.REACT_APP_SERVER_URL}/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      localStorage.removeItem("jwtoken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userType");
      localStorage.removeItem("userEmail");

      dispatch({
        type: "USER",
        payload: null,
      });

      dispatch({
        type: "USER_TYPE",
        payload: null,
      });

      closeMenu();
      setIsLoggingOut(false);

      navigate("/login");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.activeLink : ""}`;

  const renderRoleLinks = () => {
    if (!isLoggedIn) {
      return null;
    }

    if (userType === "seller") {
      return (
        <>
          <NavLink to="/dashboard" className={navLinkClass} onClick={closeMenu}>
            Dashboard
          </NavLink>

          <NavLink
            to="/property/new"
            className={navLinkClass}
            onClick={closeMenu}
          >
            List Property
          </NavLink>
        </>
      );
    }

    if (userType === "buyer") {
      return (
        <>
          <NavLink
            to="/properties"
            className={navLinkClass}
            onClick={closeMenu}
          >
            Browse Properties
          </NavLink>

          <NavLink to="/dashboard" className={navLinkClass} onClick={closeMenu}>
            Dashboard
          </NavLink>
        </>
      );
    }

    if (userType === "admin") {
      return (
        <NavLink to="/dashboard" className={navLinkClass} onClick={closeMenu}>
          Admin Dashboard
        </NavLink>
      );
    }

    return null;
  };

  const navigationStyle = {
    ...styles.navigation,
    ...(isMobile
      ? menuOpen
        ? styles.navigationMobileOpen
        : styles.navigationMobileClosed
      : styles.navigationDesktop),
  };

  return (
    <header style={styles.nav}>
      <div style={styles.container}>
        <Link
          to="/"
          style={styles.logoLink}
          onClick={closeMenu}
          aria-label="UrbanNest home"
        >
          <img src={logo} alt="UrbanNest" style={styles.logo} />
        </Link>

        {isMobile && (
          <button
            type="button"
            style={styles.menuButton}
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
          >
            <span
              style={{
                ...styles.menuLine,
                ...(menuOpen ? styles.menuLineTopOpen : {}),
              }}
            />
            <span
              style={{
                ...styles.menuLine,
                ...(menuOpen ? styles.menuLineMiddleOpen : {}),
              }}
            />
            <span
              style={{
                ...styles.menuLine,
                ...(menuOpen ? styles.menuLineBottomOpen : {}),
              }}
            />
          </button>
        )}

        <nav style={navigationStyle}>
          <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
            Home
          </NavLink>

          {renderRoleLinks()}

          {isLoggedIn ? (
            <button
              type="button"
              style={{
                ...styles.authButton,
                ...(isLoggingOut ? styles.authButtonDisabled : {}),
              }}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing Out..." : "Logout"}
            </button>
          ) : (
            <Link to="/login" style={styles.authButton} onClick={closeMenu}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  nav: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    position: "relative",
    zIndex: 50,
  },

  container: {
    width: "100%",
    maxWidth: "1250px",
    minHeight: "76px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    boxSizing: "border-box",
    position: "relative",
  },

  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    flexShrink: 0,
  },

  logo: {
    width: "150px",
    maxHeight: "55px",
    objectFit: "contain",
    display: "block",
  },

  navigation: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "24px",
  },

  navigationDesktop: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },

  navigationMobileOpen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: "4px",
    position: "absolute",
    top: "76px",
    left: 0,
    right: 0,
    padding: "16px 24px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 12px 25px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },

  navigationMobileClosed: {
    display: "none",
  },

  link: {
    color: "#4b5563",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    padding: "8px 0",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
  },

  activeLink: {
    color: "#4f46e5",
    borderBottomColor: "#4f46e5",
  },

  authButton: {
    color: "#ffffff",
    backgroundColor: "#4f46e5",
    border: "none",
    textDecoration: "none",
    borderRadius: "9px",
    padding: "10px 17px",
    fontSize: "14px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },

  authButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  menuButton: {
    display: "flex",
    width: "42px",
    height: "42px",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    padding: "8px",
    cursor: "pointer",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  },

  menuLine: {
    display: "block",
    width: "22px",
    height: "2px",
    backgroundColor: "#374151",
    borderRadius: "2px",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  },

  menuLineTopOpen: {
    transform: "translateY(6px) rotate(45deg)",
  },

  menuLineMiddleOpen: {
    opacity: 0,
  },

  menuLineBottomOpen: {
    transform: "translateY(-6px) rotate(-45deg)",
  },
};

export default Navbar;
