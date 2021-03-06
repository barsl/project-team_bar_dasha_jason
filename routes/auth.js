const router = require("express").Router();
const validator = require("validator");
const crypto = require("crypto");
const auth = require('../middleware/auth');
const {stripCredentials} = require('../util/functions/UserUtil');
require("dotenv").config();
let User = require("../models/user.model");
const withGoogleOAuth2 = require("../middleware/withGoogleOAuth2");

function generateSalt() {
  return crypto.randomBytes(16).toString("base64");
}

function generateHash(password, salt) {
  let hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  return hash.digest("base64");
}

function checkUsername(req, res, next) {
  req.body.username = validator.trim(req.body.username);
  req.body.username = validator.escape(req.body.username);
  next();
}

router.route("/signin").post(checkUsername, (req, res) => {
  const password = req.body.password;
  const username = req.body.username;

  User.findOne({ username }).then(user => {
    if (!user) return res.status(404).json("No user with this email");

    if (user.password !== generateHash(password, user.salt)) {
      return res.status(400).json("Invalid credentials");
    }

    req.session.user = { username: user.username, id: user._id };
    return res.json(req.session.user.username);
  });
});

router.route("/signup").post(checkUsername, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;

  User.findOne({ username }).then(user => {
    if (user)
      return res.status(409).json("User with this username already exists");

    let salt = generateSalt();
    let saltedPassword = generateHash(password, salt);

    const newUser = new User({
      username,
      password: saltedPassword,
      salt,
      name,
      interests: [],
      friends: [],
      friend_requests: [],
      invitedEvents: [],
      attendingEvents: [],
      history: []
    });

    newUser
      .save()
      .then(savedUser => {
        req.session.user = { username: savedUser.username, id: savedUser._id };
        res.json(stripCredentials(savedUser.toObject()));
      })
      .catch(err => {
        return res.status(500).json(err);
      });
  });
});

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.clearCookie("username");
  res.json("Logged out");
});

router.route("/verify").get((req, res) => {
  if (!req.session.user) res.json({ isValid: false });
  else res.json({ isValid: true });
});

router.get("/authenticateGoogleUser", auth, withGoogleOAuth2, (req, res) => {
  const authUrl = req.oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"] //change scope if necessary
  });
  res.json(authUrl);
});

module.exports = router;
