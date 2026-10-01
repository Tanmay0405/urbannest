const bcrypt = require("bcryptjs");

const User = require("../model/userSchema");

const ALLOWED_ROLES = ["buyer", "seller", "admin"];

const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

// ==============================
// REGISTER
// BUYER / SELLER / ADMIN
// ==============================

const register = async (req, res, next) => {
  try {
    const { name, email, phone, userType, password, cpassword, adminKey } =
      req.body;

    // ------------------------------
    // Basic validation
    // ------------------------------

    if (!name || !email || !phone || !userType || !password || !cpassword) {
      return res.status(422).json({
        error: "Please fill all required fields.",
      });
    }

    // ------------------------------
    // Normalize input
    // ------------------------------

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\D/g, "");
    const normalizedRole = String(userType).trim().toLowerCase();

    // ------------------------------
    // Validate role
    // ------------------------------

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(422).json({
        error: "Invalid user role.",
      });
    }

    // ------------------------------
    // Admin protection
    // ------------------------------

    if (normalizedRole === "admin") {
      if (!adminKey) {
        return res.status(422).json({
          error: "Admin key is required.",
        });
      }

      if (!process.env.ADMIN_KEY) {
        return res.status(500).json({
          error: "Admin registration is not configured on the server.",
        });
      }

      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({
          error: "Invalid admin key.",
        });
      }
    }

    // ------------------------------
    // Name validation
    // ------------------------------

    if (!nameRegex.test(normalizedName)) {
      return res.status(422).json({
        error: "Please enter your full name.",
      });
    }

    // ------------------------------
    // Email validation
    // ------------------------------

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(422).json({
        error: "Please enter a valid email address.",
      });
    }

    // ------------------------------
    // Phone validation
    // ------------------------------

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(422).json({
        error: "Please enter a valid 10-digit phone number.",
      });
    }

    // ------------------------------
    // Password validation
    // ------------------------------

    if (typeof password !== "string" || password.length < 8) {
      return res.status(422).json({
        error: "Password must contain at least 8 characters.",
      });
    }

    if (password !== cpassword) {
      return res.status(422).json({
        error: "Password and confirm password do not match.",
      });
    }

    // ------------------------------
    // Duplicate email
    // ------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // ------------------------------
    // Create user
    // ------------------------------

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      userType: normalizedRole,
      password,

      institution: "N/A",
      department: "N/A",

      adminKey: normalizedRole === "admin" ? adminKey : null,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      userType: normalizedRole,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    next(error);
  }
};

// ==============================
// LOGIN
// ==============================

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Please enter email and password.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // ------------------------------
    // Reject legacy roles
    // ------------------------------

    if (!ALLOWED_ROLES.includes(user.userType)) {
      return res.status(403).json({
        error:
          "This account belongs to the previous system. Please create a new UrbanNest account.",
      });
    }

    // ------------------------------
    // Generate JWT
    // ------------------------------

    const token = await user.generateAuthToken();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      userLogin: user,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    next(error);
  }
};

// ==============================
// LOGOUT
// ==============================

const logout = async (req, res, next) => {
  try {
    if (!req.rootUser) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    // Remove only the current JWT when available.
    // This keeps other active sessions logged in.
    if (req.token) {
      req.rootUser.tokens = req.rootUser.tokens.filter(
        (storedToken) => storedToken.token !== req.token,
      );
    } else {
      // Fallback for older logout requests.
      req.rootUser.tokens = [];
    }

    await req.rootUser.save();

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
