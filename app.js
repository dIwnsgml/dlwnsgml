const express = require("express");
const app = express();
const port = 80;
const ejs = require("ejs");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
//const expressValidator = require('express-validator');
const session = require("express-session");
const bodyParser = require("body-parser");
const connection = require("./model/db");
const helmet = require("helmet");
const secret = require('./config/info.json');
const http = require('http');
const crypto = require("crypto")
var server = http.createServer(app);
var io = require('socket.io')(server);



app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
//app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  res.setHeader("X-XSS-protection", "1; mode=block");
  //console.log(res.locals.cspNonce)
  next();
});
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

const cspOptions = {
  directives: {
    defaultSrc: ["'self'", "*.googleapis.com", "'unsafe-inline'", "*.fonts.gstatic.com", "*.googletagmanager.com", "*.fontawesome.com", "https://googleads.g.doubleclick.net", "https://pagead2.googlesyndication.com",  'https://tpc.googlesyndication.com/sodar/sodar2.js', ""],
    scriptSrc: ["'self'", "'unsafe-eval'", "*.swiper-bundle.min.js", "https://unpkg.com/swiper@6.8.4/swiper-bundle.min.js", "*.fontawesome.com", "https://pagead2.googlesyndication.com", "*.google.com", "partner.googleadservices.com", "https://tpc.googlesyndication.com", "*.googletagmanager.com"],
    frameSrc: ["'self'", "https://googleads.g.doubleclick.net", 'https://tpc.googlesyndication.com', "https://*.google.com", "*.googletagmanager.com"],
    "img-src": ["'self'", "data:", "https://pagead2.googlesyndication.com", "https://ad.doubleclick.net", "*.googletagmanager.com"],
  }
}

app.use(helmet.contentSecurityPolicy(cspOptions))

const mainRouter = require("./Router/main");


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('socketio', io);


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secret.secretId));
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
  secret: secret.secretId,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 10,
    secure: false,
    httpOnly: true,
    signed: true,
    authorized: true,
  },
  //store: new fileStore(),
}))

//app.use(expressValidator());

app.use('/', mainRouter);



app.get('*',function(req,res){
  res.redirect('/');
});

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // error for local
  if(secret.place != 'dev'){
    err.message = {}
    res.render('error');
  }
  /* res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; */

  // 에러 보여줌
  res.status(err.status || 500);
  res.render(err.message);
});

server.listen(port, secret.address, () => {
  console.log(`Server running ${port}`);
});

module.exports = app;