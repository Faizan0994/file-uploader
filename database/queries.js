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
