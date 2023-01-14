const express = require('express')
const app = express()
const isLoggedIn = require('./Middleware/auth')
require('./passport.js');
const session = require('express-session')
const passport = require('passport')
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

//Middleware
app.use(session({
    secret: "ajklffdsa",
    resave: false ,
    saveUninitialized: true ,
}))

app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"


//Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Developer Console
const GOOGLE_CLIENT_ID = "97261444427-5t50in9dcvgmjr3nvnvlbv4e7vn3or01.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

authUser = (request, accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  }, authUser));


passport.serializeUser( (user, done) => { 
    console.log(`\n--------> Serialize User:`)
    console.log(user)
     // The USER object is the "authenticated user" from the done() in authUser function.
     // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.  

    done(null, user)
} )


passport.deserializeUser((user, done) => {
        console.log("\n--------- Deserialized User:")
        console.log(user)
        // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
        // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

        done (null, user)
}) 


//Start the NODE JS server
app.listen(3000, () => console.log(`Server started on port 3000...`))


//console.log() values of "req.session" and "req.user" so we can see what is happening during Google Authentication
let count = 1
showlogs = (req, res, next) => {
    console.log("\n==============================")
    console.log(`------------>  ${count++}`)

    console.log(`\n req.session.passport -------> `)
    console.log(req.session.passport)
  
    console.log(`\n req.user -------> `) 
    console.log(req.user) 
  
    console.log("\n Session and Cookie")
    console.log(`req.session.id -------> ${req.session.id}`) 
    console.log(`req.session.cookie -------> `) 
    console.log(req.session.cookie) 
  
    console.log("===========================================\n")

    next()
}

app.use(showlogs)


app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));

//Define the Login Route
app.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect('/');
    }
    res.render('login');
})


//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  res.redirect('/login');
}

//Define the Protected Route, by using the "checkAuthenticated" function defined above as middleware
app.get('/', checkAuthenticated, (req, res, next) => {
  res.render('main', {name: req.user.displayName})
})

app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/facebook',passport.authenticate('facebook'));
/*app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/login' }),
function(req, res) {
    res.redirect('/');
});
*/
const facebookCallback = passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'});
const passportErrorHandler = (err, req, res, next) => {
	// Here you can handle passport errors
	console.error(`Passport error: ${err.message}`);
	res.redirect('/');
};

app.get('/auth/facebook/callback', facebookCallback, passportErrorHandler)

//Define the Logout
app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
  console.log(`-------> User Logged out`)
})

app.get('/russia', checkAuthenticated, (req, res, next) => {
  res.render('russia', {name: req.user.displayName});
});

app.get('/intermediary', checkAuthenticated, (req, res, next) => {
  res.render('intermediary', {name: req.user.displayName});
});

app.get('/benefits', checkAuthenticated, (req, res, next) => {
  res.render('benefits', {name: req.user.displayName});
});

app.use('*', (req, res) => {
  res.render('not_found');
})
