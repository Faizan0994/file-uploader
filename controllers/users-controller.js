const express = require("express");
const multer = require("multer");
const path = require("path");

// Storage handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./tmp/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4096, // 4 MB
  },
});

// Controllers
exports.dashboardGet = (req, res) => {
  let user = req.user;
  if (user) {
    res.render("dashboard", { name: user.name });
  } else {
    res.redirect("/auth");
  }
};

exports.uploadGet = (req, res) => {
  if (!req.user) return res.redirect("/auth"); // Confirm the user is logged in

  res.render("upload");
};

exports.uploadPost = [
  upload.single("uploadedFile"),
  (req, res) => {
    res.redirect("/users/dashboard");
  },
];
