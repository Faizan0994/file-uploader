const prisma = require("./client");

exports.registerUser = async (name, username, password) => {
  await prisma.user.create({
    data: {
      name: name,
      username: username,
      password: password,
    },
  });
};

exports.getAllUsers = async () => {
  return await prisma.user.findMany();
};

exports.getUserByUsername = async (username) => {
  const user = await prisma.user.findUnique({ where: { username: username } });
  return user;
};

exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: id } });
  return user;
};

exports.getFolderByPath = async (folderPath, userId) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { userId: userId, path: folderPath },
    });
    return folder;
  } catch (error) {
    console.log(error);
  }
};

exports.getFolderContent = async (folderPath, userId) => {
  try {
    if (folderPath === "") {
      // The root directory
      const folders = await prisma.folder.findMany({
        where: { userId: userId, parentId: null },
      });
      const files = await prisma.file.findMany({
        where: { userId: userId, folderId: null },
      });
      return [folders, files];
    }

    const folder = await prisma.folder.findUnique({
      where: { path: folderPath, userId: userId },
      include: { children: true, files: true },
    });
    return [folder.children, folder.files];
  } catch (error) {
    console.log(error);
  }
};

exports.createFolder = async (currentDirectory, folderName, userId) => {
  try {
    const folderPath = currentDirectory
      ? `${currentDirectory}/${folderName}`
      : folderName;
    const parentFolder = currentDirectory
      ? await this.getFolderByPath(currentDirectory, userId)
      : null;

    await prisma.folder.create({
      data: {
        name: folderName,
        path: folderPath,
        user: { connect: { id: userId } },
        parent: parentFolder ? { connect: { id: parentFolder.id } } : undefined,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteFolder = async (folderPath, userId) => {
  try {
    await prisma.folder.delete({
      where: {
        userId: userId,
        path: folderPath,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.renameFolder = async (folderPath, userId, newName) => {
  try {
    // Gather information
    const folder = await this.getFolderByPath(folderPath, userId);
    let parent;
    if (folder.parentId)
      parent = await prisma.folder.findUnique({
        where: { id: folder.parentId },
      });
    else parent = null;
    const currentPath = folder.path;
    let parentPath;
    if (parent) parentPath = parent.path + "/";
    else parentPath = "";
    newPath = parentPath + newName;

    // Updates
    const nameUpdate = prisma.folder.update({
      where: { path: folderPath, userId: userId },
      data: { name: newName, path: newPath },
    });
    const folderPathUpdate = prisma.$executeRaw`
      UPDATE "Folder" 
      SET path = REPLACE(path, ${folderPath + "/"}, ${newPath + "/"})
      WHERE path LIKE ${folderPath + "/%"};
    `;
    // const filePathUpdate = prisma.$executeRaw`    //Currently not in use
    //   UPDATE "File"
    //   SET path = REPLACE(path, ${currentPath + "/"}, ${newPath + "/"})
    //   WHERE path LIKE ${currentPath + "/%"};
    // `;
    await prisma.$transaction([
      nameUpdate,
      folderPathUpdate /*, filePathUpdate*/,
    ]);
  } catch (error) {
    console.log(error);
  }
};

exports.registerFile = async (
  name,
  storedName,
  path,
  size,
  currentDirectory,
  userId
) => {
  try {
    const folder = await this.getFolderByPath(currentDirectory, userId);
    await prisma.file.create({
      data: {
        name: name,
        storedName: storedName,
        path: path,
        directory: folder ? { connect: { id: folder.id } } : undefined,
        size: size,
        user: { connect: { id: userId } },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getFileByPath = async (path, userId) => {
  const folderPath = path.slice(0, path.lastIndexOf("/"));
  const directory = await this.getFolderByPath(folderPath, userId);
  const name = path.slice(path.lastIndexOf("/") + 1);
  try {
    const file = await prisma.file.findFirst({
      where: { directory: directory, name: name, userId: userId },
    });
    return file;
  } catch (error) {
    console.log(error);
  }
};

exports.deleteFile = async (path, userId) => {
  const file = await this.getFileByPath(path, userId);
  try {
    await prisma.file.delete({
      where: { id: file.id, userId: userId },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.renameFile = async (path, newName, userId) => {
  const file = await this.getFileByPath(path, userId);
  try {
    await prisma.file.update({
      where: {
        id: file.id,
      },
      data: {
        name: newName,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.renameFileById = async (fileId, newName, userId) => {
  try {
    await prisma.file.update({
      where: {
        id: fileId,
        userId: userId,
      },
      data: {
        name: newName,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getFileById = async (fileId, userId) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        userId: userId,
      },
    });
    return file;
  } catch (error) {
    console.log(error);
  }
};
