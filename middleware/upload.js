const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "data/storage");
  },

  filename: function(req, file, cb) {
    const unique =
      Date.now() + "-" + file.originalname;

    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024
  }
});

module.exports = upload;