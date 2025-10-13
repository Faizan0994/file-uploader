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
