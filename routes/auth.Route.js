const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REQUIRE THE MIDDLEWARES
const userDetails = require("../middlewares/userDetails.middleware");

const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const User = require("../models/User.Schema");

const jwt_secret = "somesortofsecret";

router.get("/", async (req, res) => {
  res.send(`Hello darkness my old friend...`);
});

//POST: api/auth/signup
router.post(
  "/signup",
  //MIDDLEWARE FOR EXPRESS-VALIDATOR
  [
    body("name")
      .isLength({ min: 5 })
      .withMessage("Name must be at least 5 characters long"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("role"),
  ],
  async (req, res) => {
    //validationResult = Extracts the validation errors of an express request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //CHEACKING IF EMAIL IS ALREADY REGISTERED
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already exists. Please try another one." });
      }

      //HASHING THE PASSWORD
      const plainPassword = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const hashPass = await bcrypt.hash(plainPassword, salt);
      // console.log(plainPassword + " 0 " + salt + " 0 " + hashPass);

      //CREATING THE USER IN DATABASE USING .CREATE()
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPass,
        role: req.body.role,
      });

      //CREATE JWT AUTHENTICATION
      const payload = { id: user._id };
      const token = jwt.sign(payload, jwt_secret);
      // console.log(user);
      res
        .status(200)
        .json({
          user: { email: user.email, userName: user.name },
          token: token,
        });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Some Error occured");
    }
  }
);

//POST: api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("password must exist"),
  ],
  async (req, res) => {
    const result = validationResult(req);
    const result2 = result.formatWith((error) => error.msg);

    if (!result2.isEmpty()) {
      return res.status(400).json({ errors: result2.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      const passwordComp = await bcrypt.compare(password, user.password);
      if (!passwordComp) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      //CREATE JWT AUTHENTICATION
      const payload = { id: user._id };
      const token = jwt.sign(payload, jwt_secret);
      // console.log(token);
      res.status(200).json({
        msg: "Successfully Logged In",
        user: { email: user.email, userName: user.name },
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

//GET: api/auth/getUser
router.post("/getuser", userDetails, async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password");
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ msg: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
