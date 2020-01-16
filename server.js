require("dotenv").load();

var express = require("express");
var app = express();

//FAVICON
var favicon = require("serve-favicon");
app.use(favicon(__dirname + "/public/images/favicon.ico"));
var session = require("express-session");

var mongoose = require("mongoose");
var passport = require("passport");

var routes = require("./app/routes/index.js");
var helmet = require("helmet");

var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoSanitize = require("express-mongo-sanitize");

//var morgan = require('morgan')
//app.use(morgan('dev'));

require("node-jsx").install();

require("./app/config/passport")(passport);

//VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", __dirname + "/public/views");

//MONGOOSE CONNECT
mongoose.connect(process.env.MONGO_URI);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(mongoSanitize());

//HTTP HEADERS
app.use(helmet());

//STATIC FILES
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/controllers", express.static(process.cwd() + "/app/controllers"));
app.use("/components", express.static(process.cwd() + "/app/components"));

var MongoStore = require("connect-mongo")(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 1 * 24 * 60 * 60,
      autoRemove: "interval",
      autoRemoveInterval: 10,
      touchAfter: 24 * 3600
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

//ROUTES
routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("App listening on port: " + port);
});
