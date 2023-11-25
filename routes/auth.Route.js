const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const User = require("../models/User.Schema");

router.get("/", async (req, res) => {
  res.send(`Hello, ${req.query.name}!`);
});

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
      return res.status(404).json({ errors: errors.array() });
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
      const jwt_secret = "somesortofsecret";
      const payload = { id: user._id };
      jwt.sign(
        payload,
        jwt_secret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );

      // res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Some Error occured");
    }
  }
);

module.exports = router;
