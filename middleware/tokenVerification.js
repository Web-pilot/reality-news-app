const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.user.accessToken;
  if (authHeader) {
    const token = authHeader;
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json("Token not valid!");
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(401).json("You're not authenticated");
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id == req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You're not allowed to do this");
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAdmin };
