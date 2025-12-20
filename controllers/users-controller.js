const express = require("express");
const multer = require("multer");
const path = require("path");
const queries = require("../database/queries");
const { body } = require("express-validator");

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

exports.dashboardPathGet = async (req, res) => {
  let user = req.user;
  if (user) {
    let path = req.params.path === "root" ? "" : req.params.path; // use "root" to represent ""
    let content = await queries.getFolderContent(path, user.id);
    res.render("dashboard", {
      name: user.name,
      content: content,
      current: path + "/",
    });
  } else {
    res.redirect("/auth");
  }
};

exports.dashboardGet = async (req, res) => {
  let user = req.user;
  if (user) {
    res.redirect("/users/dashboard/root");
  } else {
    res.redirect("/auth");
  }
};

exports.deleteFolderPost = async (req, res) => {
  let user = req.user;
  if (user) {
    let path = req.params.path;
    await queries.deleteFolder(path, user.id);
    let current = req.body.currentPath;
    current = current.replace("/", "%2F");
    res.redirect(`/users/dashboard/${current}`);
  } else {
    res.redirect("/auth");
  }
};

exports.createFolderPost = async (req, res) => {
  let user = req.user;
  if (user) {
    let path = req.params.path === "root" ? "" : req.params.path; // use "root" to represent ""
    let folderName = req.body.folderName;
    await queries.createFolder(path, folderName, user.id);
    path = path.replace("/", "%2F");
    res.redirect(`/users/dashboard/${path}`);
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
    /*
    name: originalname,
    storedName: filename,
    path: path,
    size: size
    */
    res.redirect("/users/dashboard");
  },
];
