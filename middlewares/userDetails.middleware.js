//require jwt
const jwt = require("jsonwebtoken");
const jwt_secret = "somesortofsecret";

const fetchUser = async (req, res, next) => {
  //get the user from the jwt token
  const token = req.get("Authorization");

  if (!token) {
    return res.status(401).json({
      message: "Access Denied",
    });
  }

  try {
    try {
      const decoded = jwt.verify(token, jwt_secret);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({
        message: "Access Denied trycatch",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(501).json({
      message: "Server Error from fetchuser",
    });
  }
};

module.exports = fetchUser;
