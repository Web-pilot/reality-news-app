const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const emailTemplate = require("./resetEmailTemplate");
const Pool = require("../db");

// USING NODEMAILER TO SEND USER RESET PASSWORD LINK
const sendResetPasswordEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await Pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (!user.rows[0]) {
    res.status(404).json("No user found with the email address");
  } else {
    // CREATE MAIL OBJECT
    let mailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    //  TOKEN FOR VERIFYING USER
    const token = jwt.sign(
      {
        id: user.rows[0].userid,
        email: user.rows[0].email,
      },
      process.env.RESET_PASSWORD_PASSCODE,
      { expiresIn: "1d" }
    );

    //  RESET PASSWORD URL
    const url = `${process.env.APP_DOMAIN}/account/resetpassword?token=${token}`;
    let details = {
      from: '"Reality News App" <${process.env.EMAIL_USER}>',
      to: user.rows[0].email,
      subject: "Reset password link",
      html: emailTemplate(url),
    };
    //  SEND MAIL
    mailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Email has been sent successfully");
        next();
      }
    });
  }
};

module.exports = { sendResetPasswordEmail };
