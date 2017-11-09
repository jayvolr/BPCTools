const bodyParser = require('body-parser');
const express = require('express');
const flash = require('connect-flash');
const hbs = require('hbs');
const mongo = require('mongodb');
const secrets = require('./secrets.js');
const session = require('express-session');

const app = express();
const db = app.get('env') === 'production' ? require('monk')('localhost:27017/prod') : require('monk')('localhost:27017/bpcDev');

app
  .set('view engine', 'hbs')
  .use(express.static(`${__dirname}/public`))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(session({
    secret: secrets.sessionSecret,
    resave: false,
    saveUninitialized: false
  }))
  .use((req, res, next) => {
    req.db = db;
    next();
  })
  .use(flash())
  .get('/', (req, res) => {
    if (req.session.authenticated) {
      res.render('home', {info: req.flash('info')[0], error: req.flash('error')[0]});
    }else {
      res.render('auth', {info: req.flash('info')[0], error: req.flash('error')[0]});
    }
  })
  .post('/auth', (req, res) => {
    if (secrets.adminPassword === req.body.password) {
      req.flash('info', 'good job u did it');
      req.session.authenticated = true;
      res.redirect('/');
    }else {
      req.flash('error', 'incorrect password');
      req.session.authenticated = false;
      res.redirect('/');
    }
  })
  // BELOW HERE, AUTHENTICATED USER REQUIRED
  .use((req, res, next) => {
    if (req.session.authenticated) {
      next();
    }else {
      res.redirect('/');
    }
  })
  .get('/db', (req, res) => {
    const people = req.db.get('people');
    people.find({}).then(data => {
      res.send(data);
    });
  })
  .get('/write', (req, res) => {
    res.render('write');
  })
  .get('/s', (req, res) => {
    res.send(req.session);
  })
  .listen(secrets.port, () => {
    console.log(`Server listening on port ${secrets.port}...`);
  })
