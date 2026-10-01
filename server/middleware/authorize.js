const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.rootUser) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.rootUser.userType)) {
      return res.status(403).json({
        error: "You are not authorized to perform this action.",
      });
    }

    next();
  };
};

module.exports = authorize;