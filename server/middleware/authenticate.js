const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const Authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ------------------------------
    // Authorization header
    // ------------------------------

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
        code: "NO_TOKEN",
      });
    }

    const parts = authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format.",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    const token = parts[1];

    // ------------------------------
    // Verify JWT
    // ------------------------------

    let verifyToken;

    try {
      verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error:
          error.name === "TokenExpiredError"
            ? "Token has expired."
            : "Invalid or expired token.",
        code:
          error.name === "TokenExpiredError"
            ? "TOKEN_EXPIRED"
            : "INVALID_TOKEN",
      });
    }

    if (!verifyToken?._id) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token.",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // ------------------------------
    // Find authenticated user
    // ------------------------------

    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });

    if (!rootUser) {
      return res.status(401).json({
        success: false,
        error: "Authenticated user or token not found.",
        code: "USER_TOKEN_NOT_FOUND",
      });
    }

    // ------------------------------
    // Attach authentication context
    // ------------------------------

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
  } catch (error) {
    console.error("AUTHENTICATION ERROR:", error);

    return res.status(401).json({
      success: false,
      error: "Authentication failed.",
      code: "AUTHENTICATION_FAILED",
    });
  }
};

module.exports = Authenticate;
