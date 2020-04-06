import * as bcrypt from 'bcryptjs';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/user.schema';

export default function initializePassport() {
  passport.use(
    'local',
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        const user = await User.findOne({ email }); // use service
        if (!user) {
          return done(null, false, {
            message: 'Invalid email or password',
          });
        }
        const validation = await bcrypt.compare(password, user.password);
        if (!validation) {
          return done(null, false, {
            message: 'Invalid email or password',
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
        const user = await User.findOne({ _id: payload.id }); // use service
        if (!user) {
          return done(null, false, {
            message: 'Invalid email or password',
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
