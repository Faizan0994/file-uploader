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
    current = current.replace("/", "%2F").replace(" ", "%20");
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
    path = path.replace("/", "%2F").replace(" ", "%20");
    res.redirect(`/users/dashboard/${path}`);
  } else {
    res.redirect("/auth");
  }
};

exports.renameFolderPost = async (req, res) => {
  let user = req.user;
  if (user) {
    let path = req.params.path;
    let current = req.body.currentPath;
    let newName = req.body.newName;
    await queries.renameFolder(path, user.id, newName);
    current = current.replace("/", "%2F").replace(" ", "%20");
    res.redirect(`/users/dashboard/${current}`);
  } else {
    res.redirect("/auth");
  }
};

exports.uploadGet = (req, res) => {
  if (!req.user) return res.redirect("/auth"); // Confirm the user is logged in
  let path = req.params.path;

  res.render("upload", { current: path });
};

exports.uploadPost = [
  upload.single("uploadedFile"),
  async (req, res) => {
    let user = req.user;
    let path = req.params.path;
    if (path === "root") path = "";
    const file = req.file;
    await queries.registerFile(
      file.originalname,
      file.filename,
      file.path,
      file.size,
      path,
      user.id
    );
    /*
    name: originalname,
    storedName: filename,
    path: path,
    size: size
    */
    if (path === "") path = "root";
    res.redirect(`/users/dashboard/${path}`);
  },
];

exports.deleteFilePost = async (req, res) => {
  const user = req.user;
  if (user) {
    let name = req.params.name;
    let current = req.body.currentPath;
    let path = current + "/" + name;
    await queries.deleteFile(path, user.id);
    current = current.replace("/", "%2F").replace(" ", "%20");
    res.redirect(`/users/dashboard/${current}`);
  } else {
    res.redirect("/auth");
  }
};

exports.renameFilePost = async (req, res) => {
  let user = req.user;
  if (user) {
    let id = +req.params.id;
    let current = req.body.currentPath;
    let newName = req.body.newName;
    await queries.renameFileById(id, newName, user.id);
    current = current.replace("/", "%2F").replace(" ", "%20");
    res.redirect(`/users/dashboard/${current}`);
  } else {
    res.redirect("/auth");
  }
};

exports.fileGet = async (req, res) => {
  let user = req.user;
  if (user) {
    const id = +req.params.id;
    const file = await queries.getFileById(id, user.id);
    res.render("file", { file: file });
  } else {
    res.redirect("/auth");
  }
};

exports.download = async (req, res) => {
  let user = req.user;
  if (user) {
    const id = +req.params.id;
    const file = await queries.getFileById(id, user.id);
    res.download(file.path, file.name);
  } else {
    res.redirect("/auth");
  }
};
