const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const conn = require("../db/connection");
const bcrypt = require("bcryptjs");
const util = require("util");



router.post(
  "/register",
  body("name")
  .isString()
  .withMessage("Please enter a valid name"),

  body("email")
  .isEmail()
  .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between 8 to 12 characters"),
  async (req, res) => {
    try {
      // Validation of request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if email exists
      const query = util.promisify(conn.query).bind(conn);
      const checkEmailExists = await query(
        "SELECT * FROM users WHERE email = ?",
        [req.body.email]
      );

    if (checkEmailExists.length > 0) {
        return res.status(402).json({ ms: "This email already exists!" });
   }

          // Prepare user object for saving
    const registerData = {
        email: req.body.email,
        name: req.body.name,
        password: await bcrypt.hash(req.body.password, 10),
    };
             // Insert user into database
         await query("INSERT INTO users SET ?", registerData);
         delete registerData.password;
         res.status(200).json({ message: "User registered successfully", user: registerData });
       } catch (error) {
        res.status(500).json({ error: error.message });
      }
  });

router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between 8 to 12 characters"),
  async (req, res) => {
    try {
      // Validation of request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if email exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM users WHERE email = ?", [req.body.email]);
      if (user.length === 0) {
        return res.status(402).json({ ms: "This email does not exist" });
      }

      // Compare hashed password
      const checkPassword = await bcrypt.compare(req.body.password, user[0].password);
      if (checkPassword) {
        delete user[0].password;
        res.status(200).json({ message: "Login successful", user: user[0] });
      } else {
        res.status(405).json({ ms: "Password is incorrect" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);




 module.exports = router;