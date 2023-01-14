const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new FacebookStrategy({
  clientID: "941289986857696",
  clientSecret: "1f53bac8344d0bd994c4f02eb2e6aa56",
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
));