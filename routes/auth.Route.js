const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");

//REQUIRE THE MODEL
const User = require("../models/User.Schema");

//REQUIRE THE MIDDLEWARES
const fetchUser = require("../middlewares/fetchUser.middleware");

const jwt_secret = process.env.JWT_SECRET;

router.get("/getalluser", async (req, res) => {
  // res.send(`Hello darkness my old friend...`);
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.send({
      success: false,
      message: "Some Error occured during getting all users",
    });
    console.error(error);
  }
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
    body("role").optional(),
  ],
  async (req, res) => {
    //validationResult = Extracts the validation errors of an express request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      //CHEACKING IF EMAIL IS ALREADY REGISTERED
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists. Please try another one.",
        });
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
      res.status(200).json({
        // user: { email: user.email, userName: user.name },
        success: true,
        user: user,
        token: token,
      });
    } catch (error) {
      console.error(error.message);
      return res
        .status(500)
        .json({ message: "Some Error occured During Signup", success: false });
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
    const result2 = result.formatWith((error) => error.message);

    if (!result2.isEmpty()) {
      return res.status(400).json({ success: false, errors: result2.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Credentials" });
      }

      const passwordComp = await bcrypt.compare(password, user.password);
      if (!passwordComp) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Credentials" });
      }

      //CREATE JWT AUTHENTICATION
      const payload = { id: user._id };
      const token = jwt.sign(payload, jwt_secret);
      // console.log(token);
      res.status(200).json({
        success: true,
        message: "Successfully Logged In",
        // user: { email: user.email, userName: user.name },
        user: user,
        token: token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

//GET: api/auth/getUser
router.get("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password");
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "User Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
module.exports = router;
