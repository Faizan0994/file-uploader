const express = require("express");
const multer = require("multer");
const path = require("path");
const queries = require("../database/queries");
const { body } = require("express-validator");
const supabase = require("../database/supabaseClient");

// Storage handling
const storage = multer.memoryStorage({
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
    file.path = `${user.id}/${Date.now()}_${file.originalname}`;
    try {
      const { data, error } = await supabase.storage
        .from("fileUploader")
        .upload(file.path, file.buffer, { contentType: file.mimetype });
      await queries.registerFile(
        file.originalname,
        "N/A",
        data.path,
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
    } catch (error) {
      console.log(error);
    }
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
    const file = await queries.getFileByPath(path, user.id);
    if (!file.path.startsWith(`${user.id}/`)) {
      return res.status(403).send("Forbidden");
    }
    await supabase.storage.from("fileUploader").remove([file.path]);
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
    if (!file.path.startsWith(`${user.id}`)) {
      return res.status(403).send("Forbidden");
    }
    const { data, error } = await supabase.storage
      .from("fileUploader")
      .createSignedUrl(file.path, 60, { download: file.name });
    res.redirect(data.signedUrl);
  } else {
    res.redirect("/auth");
  }
};
