// UPLOAD PACKAGE
const multer = require("multer");

// UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = Date.now() + "-" + file.originalname;
    req.body.img = uniqueFilename;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
