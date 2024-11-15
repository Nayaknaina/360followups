require("dotenv").config();
require('./config/conn')
const express = require("express");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");

const app = express();
const path = require("path");
const port = process.env.PORT || 8000;

// todo routes
const superRouter = require('./routes/superAdmin/supder.route.js')
const indexRouter = require('./routes/index.route.js')
const adminRouter = require('./routes/admin/admin.route.js')



// todo Middleware setup
app.use(cors()); 
app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // secure: true for HTTPS
  })
);

// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Set up view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// todo Routes


app.use(express.static(path.join(__dirname, 'public')));

// todo Set views directory for indexRouter
app.use('/', (req, res, next) => {
  app.set('views', path.join(__dirname, 'views'));
  indexRouter(req, res, next);
});

//todo Set views directory for superRouter
app.use('/wsv/super', (req, res, next) => {
  app.set('views', path.resolve(__dirname, 'views', "superAdmin"));
  superRouter(req, res, next);
});


//todo Set views directory for adminRouter
app.use('/admin', (req, res, next) => {
  app.set('views', path.join(__dirname, 'views', 'admin'));
  adminRouter(req, res, next);
});

//todo Reset the views directory to the default for other routes
app.use((req, res, next) => {
  app.set('views', path.join(__dirname, 'views'));
  next();
});


const static_path = path.join(__dirname, 'public')
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(static_path, `${page}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit the process to restart the server
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1); // Exit the process to restart the server
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running at PORT:${port}`);
});

module.exports = app;
