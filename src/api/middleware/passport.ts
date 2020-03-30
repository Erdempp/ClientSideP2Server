import * as bcrypt from 'bcryptjs';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../schemas/user.schema';

export default function initializePassport() {
  passport.use(
    'local',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (username, password, done) => {
        const user = await User.findOne({ email: username }); // controller
        if (!user) {
          return done(null, false, {
            message: 'Invalid username or password',
          });
        }
        const validation = await bcrypt.compare(password, user.password);
        if (!validation) {
          return done(null, false, {
            message: 'Invalid username or password',
          });
        }
        return done(null, user);
      },
    ),
  );

  passport.use(
    'jwt',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'randomSecret',
      },
      async (payload, done) => {
        const user = await User.findOne({ _id: payload.id }); // controller
        if (!user) {
          return done(null, false, {
            message: 'Invalid username or password',
          });
        }
        return done(null, user);
      },
    ),
  );
}

export const authorizeLocal = passport.authenticate('local', {
  session: false,
});
export const authorizeJwt = passport.authenticate('jwt', { session: false });
