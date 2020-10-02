const router = require("express").Router();
const User = require("../models/User");
// const Joi = require("@hapi/joi");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");

//For Reggistering User
router.post("/register", async (req, res) => {
  //Validation
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //If user already exists
  const userExisted = await User.findOne({ email: req.body.email });
  if (userExisted) return res.send("User already reggistered");
  //Hashing Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //Registering user after validation, uniquness
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    //returning only id of registered user
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

//For Use Login
router.post("/login", async (req, res) => {
  //Validation
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //If user  exists
  const userExisted = await User.findOne({ email: req.body.email });
  if (!userExisted) return res.send("Email not registered");

  //Matching Password
  const validPassword = await bcrypt.compare(
    req.body.password,
    userExisted.password
  );
  if (!validPassword) return res.status(400).send("Incorrect Password");
  res.send("Logged In!");
});

module.exports = router;
