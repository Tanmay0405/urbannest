const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../model/userSchema");

// ==============================
// CONSTANTS
// ==============================

const ALLOWED_USER_TYPES = ["buyer", "seller", "admin"];

const nameRegex = /^\S+(?:\s+\S+)+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

// ==============================
// EMAIL TRANSPORTER
// ==============================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

// ==============================
// REGISTER
// BUYER / SELLER / ADMIN
// ==============================

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      institution,
      department,
      phone,
      userType,
      adminKey,
      password,
      cpassword,
    } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedUserType =
      typeof userType === "string" ? userType.trim().toLowerCase() : "";

    // ------------------------------
    // Required fields
    // ------------------------------

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !normalizedUserType ||
      !password ||
      !cpassword
    ) {
      return res.status(422).json({
        error: "Kindly complete all required fields.",
      });
    }

    // ------------------------------
    // Role validation
    // ------------------------------

    if (!ALLOWED_USER_TYPES.includes(normalizedUserType)) {
      return res.status(422).json({
        error: "Invalid user type.",
      });
    }

    // ------------------------------
    // Admin validation
    // ------------------------------

    if (normalizedUserType === "admin") {
      if (!adminKey) {
        return res.status(422).json({
          error: "Admin key is required.",
        });
      }

      if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(422).json({
          error: "Provided Admin Key is invalid.",
        });
      }
    }

    // ------------------------------
    // Name validation
    // ------------------------------

    if (!nameRegex.test(normalizedName)) {
      return res.status(422).json({
        error: "Kindly provide your complete name.",
      });
    }

    // ------------------------------
    // Email validation
    // ------------------------------

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(422).json({
        error: "Kindly provide a valid email address.",
      });
    }

    // ------------------------------
    // Phone validation
    // ------------------------------

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(422).json({
        error: "Kindly enter a valid 10-digit phone number.",
      });
    }

    // ------------------------------
    // Password validation
    // ------------------------------

    if (typeof password !== "string" || password.length < 7) {
      return res.status(422).json({
        error: "Password must contain at least 7 characters.",
      });
    }

    if (password !== cpassword) {
      return res.status(422).json({
        error: "Password mismatch.",
      });
    }

    // ------------------------------
    // Existing user
    // ------------------------------

    const userExist = await User.findOne({
      email: normalizedEmail,
    });

    if (userExist) {
      return res.status(422).json({
        error: "Provided email is associated with another account.",
      });
    }

    // ------------------------------
    // Create user
    // ------------------------------

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      userType: normalizedUserType,

      institution:
        typeof institution === "string" && institution.trim()
          ? institution.trim()
          : "N/A",

      department:
        typeof department === "string" && department.trim()
          ? department.trim()
          : "N/A",

      adminKey: normalizedUserType === "admin" ? adminKey : null,

      password,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    next(error);
  }
};

// ==============================
// PASSWORD RESET EMAIL TEMPLATE
// ==============================

const resetPasswordTemplate = (resetLink, userName) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Reset your UrbanNest password</title>
      </head>

      <body style="
        margin:0;
        padding:30px;
        background:#f8fafc;
        font-family:Arial,sans-serif;
      ">
        <div style="
          max-width:600px;
          margin:auto;
          background:#ffffff;
          padding:40px;
          border-radius:12px;
        ">
          <h1 style="color:#111827;">
            Hello ${userName}
          </h1>

          <p style="color:#4b5563;font-size:16px;">
            A request has been received to reset your UrbanNest password.
          </p>

          <p style="margin:30px 0;">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                background:#4f46e5;
                color:#ffffff;
                padding:12px 24px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p style="color:#6b7280;font-size:14px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
};

// ==============================
// USER VERIFICATION EMAIL
// ==============================

const verifyEmailTemplate = (verificationLink, userFind) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>UrbanNest user verification</title>
      </head>

      <body style="
        margin:0;
        padding:30px;
        background:#f8fafc;
        font-family:Arial,sans-serif;
      ">
        <div style="
          max-width:650px;
          margin:auto;
          background:#ffffff;
          padding:40px;
          border-radius:12px;
        ">
          <h1 style="color:#111827;">
            UrbanNest User Verification
          </h1>

          <p style="color:#4b5563;font-size:16px;">
            A new user has registered on UrbanNest.
          </p>

          <h2 style="color:#111827;">User Details</h2>

          <p>
            <strong>Name:</strong> ${userFind.name}
          </p>

          <p>
            <strong>Email:</strong> ${userFind.email}
          </p>

          <p>
            <strong>Phone:</strong> ${userFind.phone}
          </p>

          <p>
            <strong>Role:</strong> ${userFind.userType}
          </p>

          <p>
            <strong>Institution:</strong> ${userFind.institution}
          </p>

          <p>
            <strong>Department:</strong> ${userFind.department}
          </p>

          <p style="margin-top:30px;">
            <a
              href="${verificationLink}"
              style="
                display:inline-block;
                background:#4f46e5;
                color:#ffffff;
                padding:12px 24px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
              "
            >
              Verify User
            </a>
          </p>
        </div>
      </body>
    </html>
  `;
};

// ==============================
// PASSWORD RESET REQUEST
// ==============================

const passwordLink = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        error: "Please enter your email.",
      });
    }

    const userFind = await User.findOne({ email });

    if (!userFind) {
      return res.status(400).json({
        error: "No account was found with this email.",
      });
    }

    const token = jwt.sign({ _id: userFind._id }, process.env.SECRET_KEY, {
      expiresIn: "300s",
    });

    userFind.verifyToken = token;
    await userFind.save();

    const resetLink = `${process.env.CLIENT_URL}/forgotPassword/${userFind._id}/${token}`;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: userFind.email,
      subject: "UrbanNest Password Reset",
      html: resetPasswordTemplate(resetLink, userFind.name),
    };

    try {
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully.",
      });
    } catch (mailError) {
      console.error("PASSWORD RESET EMAIL ERROR:", mailError);

      return res.status(500).json({
        success: false,
        message: "Unable to send password reset email.",
      });
    }
  } catch (error) {
    console.error("PASSWORD LINK ERROR:", error);
    next(error);
  }
};

// ==============================
// VALIDATE PASSWORD RESET TOKEN
// ==============================

const forgotPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;

    const validUser = await User.findOne({
      _id: id,
      verifyToken: token,
    });

    if (!validUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    jwt.verify(token, process.env.SECRET_KEY);

    return res.status(200).json({
      success: true,
      validUser,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired password reset link.",
    });
  }
};

// ==============================
// SET NEW PASSWORD
// ==============================

const setNewPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password, cpassword } = req.body;

    if (typeof password !== "string" || password.length < 7) {
      return res.status(422).json({
        error: "Password must contain at least 7 characters.",
      });
    }

    if (password !== cpassword) {
      return res.status(422).json({
        error: "Password and confirm password do not match.",
      });
    }

    const validUser = await User.findOne({
      _id: id,
      verifyToken: token,
    });

    if (!validUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    jwt.verify(token, process.env.SECRET_KEY);

    validUser.password = password;
    validUser.verifyToken = undefined;

    await validUser.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("SET NEW PASSWORD ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired password reset link.",
    });
  }
};

// ==============================
// SEND EMAIL VERIFICATION LINK
// ==============================

const emailVerificationLink = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        error: "Please enter your email.",
      });
    }

    const userFind = await User.findOne({ email });

    if (!userFind) {
      return res.status(400).json({
        error: "Account not found.",
      });
    }

    const token = jwt.sign({ _id: userFind._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    userFind.verifyToken = token;
    await userFind.save();

    const verificationLink = `${process.env.CLIENT_URL}/verifyEmail/${userFind._id}/${token}`;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL || userFind.email,
      subject: "UrbanNest User Verification",
      html: verifyEmailTemplate(verificationLink, userFind),
    };

    try {
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully.",
      });
    } catch (mailError) {
      console.error("VERIFICATION EMAIL ERROR:", mailError);

      return res.status(500).json({
        success: false,
        message: "Unable to send verification email.",
      });
    }
  } catch (error) {
    console.error("EMAIL VERIFICATION LINK ERROR:", error);
    next(error);
  }
};

// ==============================
// VERIFY EMAIL
// ==============================

const verifyEmail = async (req, res, next) => {
  try {
    const { id, token } = req.params;

    const validUser = await User.findOne({
      _id: id,
      verifyToken: token,
    });

    if (!validUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    jwt.verify(token, process.env.SECRET_KEY);

    validUser.emailVerified = true;
    validUser.verifyToken = undefined;

    await validUser.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired verification link.",
    });
  }
};

// ==============================
// LOGIN
// ==============================

const login = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const userLogin = await User.findOne({
      email,
    });

    if (!userLogin) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    // Reject legacy roles that may still exist in the database.
    if (!ALLOWED_USER_TYPES.includes(userLogin.userType)) {
      return res.status(403).json({
        error:
          "This account uses an unsupported legacy role. Please contact the administrator.",
      });
    }

    const token = await userLogin.generateAuthToken();

    return res.status(200).json({
      userLogin,
      token,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    next(error);
  }
};

// ==============================
// CURRENT USER
// ==============================

const about = async (req, res) => {
  return res.status(200).json(req.rootUser);
};

const getdata = async (req, res) => {
  return res.status(200).json(req.rootUser);
};

// ==============================
// UPDATE PROFILE
// ==============================

const updateProfile = async (req, res) => {
  try {
    if (!req.rootUser) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(422).json({
        error: "Kindly fill all fields.",
      });
    }

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();

    if (!nameRegex.test(normalizedName)) {
      return res.status(422).json({
        error: "Kindly provide your complete name.",
      });
    }

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(422).json({
        error: "Kindly enter a valid 10-digit phone number.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.rootUser._id,
      {
        name: normalizedName,
        phone: normalizedPhone,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Error updating profile.",
    });
  }
};

// ==============================
// CONTACT
// ==============================

const contact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(422).json({
        error: "Please fill all contact form fields correctly.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(422).json({
        error: "Please provide a valid email address.",
      });
    }

    if (!phoneRegex.test(phone.trim())) {
      return res.status(422).json({
        error: "Please provide a valid 10-digit phone number.",
      });
    }

    if (!process.env.ADMIN_EMAIL) {
      return res.status(500).json({
        error: "Contact service is not configured.",
      });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      replyTo: normalizedEmail,
      subject: "UrbanNest Contact Request",
      text: `
Name: ${name}
Email: ${normalizedEmail}
Phone: ${phone}

Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    next(error);
  }
};

// ==============================
// LOGOUT
// ==============================

const logout = async (req, res, next) => {
  try {
    const userId = req.rootUser?._id || req.params.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const update = req.token
      ? {
          $pull: {
            tokens: {
              token: req.token,
            },
          },
        }
      : {
          $unset: {
            tokens: 1,
          },
        };

    await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully.",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  about,
  getdata,
  updateProfile,
  contact,
  logout,
  passwordLink,
  forgotPassword,
  setNewPassword,
  emailVerificationLink,
  verifyEmail,
};
