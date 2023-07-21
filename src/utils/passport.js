import passport from 'passport';
import jwt from 'passport-jwt';

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = req => {
    let token = null;
    if(req && req.cookies){
        token = req.cookies['authToken']
    };
    return token;
}

export const initializePassport = () => {
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: 'clavesecreta'
      }, async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload)
        } catch (error) {
          return done(error)
        }
      }))

      passport.serializeUser(function (user, done) {
        done(null, user.username);
      });
      
      passport.deserializeUser(function (username, done) {
        const usuario = usuarios.find(usuario => usuario.username == username)
        done(null, usuario);
      });
}

export const passportCall = strategy => {
  return async (req, res, next) => {
    passport.authenticate(strategy, (err, user, info) => {
      if(err) return next(err);
      if(!user){
        return res.status(401).send({error: info.messages ? info.messages : info.toString()})
      };
      req.user = user;
      next()
    })(req, res, next);
  }
}