// File upload utility
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../public/uploads");

// Make sure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId-timestamp-originalname
    const userId = req.user ? req.user.id : "guest";
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${extension}`);
  },
});

// Filter to accept only images and PDFs for documents
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and PDF documents are allowed!"), false);
  }
};

// Set up multer with 10MB size limit for documents
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter,
});

module.exports = upload;
