// EXPRESS ROUTE
const router = require("express").Router();
// DATABASE
const Pool = require("../db");
// FOR TOKENS
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// PASSPORT
const passport = require("passport");
const LocalStrategy = require("passport-local");
// MIDDLEWARE
const { sendResetPasswordEmail } = require("../helpers/nodemailer");

// JWT TOKEN
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.userid,
      username: user.username,
      email: user.email,
      isAdmin: user.isadmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
};

//REGISTER NEW USER
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows[0]) {
      res.status(405).json("A user already exist with the email");
    } else {
      const saltRounds = 10;

      bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) {
          console.log(err);
          return err;
        } else {
          const user = await Pool.query(
            "INSERT INTO users (email, password, isAdmin) VALUES($1, $2, $3) RETURNING *",
            [email, hash, false]
          );
          res.redirect("/account");
        }
      });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//LOGIN USER USING PASSWORD
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async function verify(email, password, cb) {
      Pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
        async (err, result) => {
          if (err) {
            return cb(err);
          }
          if (!result.rows[0]) {
            return cb(null, false, { error: "Incorrect email." });
          } else {
            const decriptedPassword = await bcrypt.compare(
              password,
              result.rows[0].password
            );
            if (!decriptedPassword) {
              return cb(null, false, { message: "Incorrect password." });
            } else {
              const accessToken = generateAccessToken(result.rows[0]);
              const { password, ...others } = result.rows[0];
              const user = { ...others, accessToken };
              return cb(null, user);
            }
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//LOGIN ROUTE
router.post(
  "/login",
  //if you want to log your req use this callback function
  //   (req, res, next) => {
  //     console.log("bodyparser", req.body);
  //     next();
  //   },

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/account",
    failureFlash: "Invalid username or password!",
  })
);

//LOG OUT OF THE APP
router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// SEND FORGET PASSWORD EMAIL
router.post("/forgetpassword", sendResetPasswordEmail, async (req, res) => {
  try {
    res.redirect("/emailsuccessmessage");
  } catch (error) {
    res.status(500).json(error);
  }
});

//VERIFY TOKEN FROM RESET PASSWORD LINK
const verifyEmailToken = (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    res.status(401).json("You are not authenticated");
  } else {
    jwt.verify(token, process.env.RESET_PASSWORD_PASSCODE, (err, user) => {
      if (err) {
        res.status(403).json("Token not valid");
      }
      req.user = user;
      next();
    });
  }
};

// RESET PASSWORD
router.post("/resetpassword", verifyEmailToken, async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.user;
    const saltRounds = 10;
    if (password) {
      bcrypt.hash(password, saltRounds, async function (err, hash) {
        if (err) {
          return err;
        } else {
          const user = await Pool.query(
            "UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
            [hash, email]
          );
          res.status(200).json("/account");
        }
      });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
