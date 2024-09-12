import passportLocal from "passport-local";
import { authRepository } from "../repositories/authRepository";
import { compareHash } from "../utils/hashFunctions";
import passport from "passport";

const LocalStrategy = passportLocal.Strategy;

const strategy = new LocalStrategy(function verify(username, password, done) {
  authRepository
    .getUserByUsername(username)
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      if (compareHash(password, user.hashedPassword) === false) {
        return done(null, false);
      }
      const newUser = {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
      };
      return done(null, newUser);
    })
    .catch((err) => done(err));
});

passport.use(strategy);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  authRepository
    .getUserById(id)
    .then((user) => {
      const newUser = {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
      };
      done(null, newUser);
    })
    .catch((err) => done(err));
});