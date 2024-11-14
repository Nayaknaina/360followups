const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const userModel = require('../models/User'); // Replace with actual model path

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          // Update existing user info
          user.name = profile.displayName;
          user.email = profile.emails[0].value; // Update this line
          user.profilePicture = profile.photos[0].value;
          await user.save();
        } else {
          // Create a new user
          user = await userModel.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value, // Update this line
            profilePicture: profile.photos[0].value,
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialize and Deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
