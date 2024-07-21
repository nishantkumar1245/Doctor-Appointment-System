const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]; 
    if (!authHeader) {
      return res.status(401).send({
        message: "Authorization header missing",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1]; // Split the header to get the token
    console.log("Token", token);

    if (!token) {
      return res.status(401).send({
        message: "Token missing",
        success: false,
      });
    }

    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      } else {
        req.body.userId = decode.id;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};
