const LocalStrategy = require("passport-local").Strategy;
const queries = require("../database/queries");

async function authenticator(username, password, done) {
  try {
    const user = await queries.getUserByUsername(username);
    if (!user) return done(null, false, "user not found");

    const hashed = user.password;
    const match = bcrypt.compare(password, hashed);
    if (!match) return done(null, false, "incorrect password");

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

function passportInit(passport) {
  passport.use(new LocalStrategy(authenticator));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await queries.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = passportInit;
