const bodyParser = require('body-parser');
const express = require('express');
const flash = require('connect-flash');
const fs = require('fs');
const hbs = require('hbs');
const mongo = require('mongodb');
const secrets = require('./secrets.js');
const session = require('express-session');

const app = express();
const db = app.get('env') === 'production' ? require('monk')('localhost:27017/prod') : require('monk')('localhost:27017/bpcDev');

// File upload middleware
const multer = require('multer')
let upload;
if (process.env.NODE_ENV === 'production') {
  upload = multer({dest: '../bigpicture.life/public/blogImages', limits: {fileSize: 2000000}});
}else if(secrets.beta === true) {
  upload = multer({dest: '../beta.bigpicture.life/public/blogImages', limits: {fileSize: 2000000}});
}else {
  upload = multer({dest: '../BPCApp/public/blogImages', limits: {fileSize: 2000000}});
}

app
  .set('view engine', 'hbs')
  .use(express.static(`${__dirname}/public`))
  .use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
  .use(bodyParser.json({ limit: '50mb' }))
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
    if (secrets.adminPassword === req.body.pwd) {
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
  .post('/write', upload.single('image'), (req, res) => {
    const blogPosts = req.db.get('blogPosts');

    const slug = req.body.title.toLowerCase().trim().replace(/\s/g, '-').replace(/[^\w-]/g, '');

    fs.renameSync(req.file.path, req.file.destination + '/' + slug +'.jpg');

    const newBlogPost = {
      content: req.body.post.replace(/<p><br><\/p>/g, '').replace(/(rgb\(39, 41, 43\))/g, '#40c2c5'),
      title: req.body.title,
      featuredText: req.body.featuredText,
      slug,
      creationDate: Date.now()
    }

    // res.send(newBlogPost);

    blogPosts.insert(newBlogPost)
      .then((docs) => {
        req.flash('info', 'Success!');
        res.redirect('/');
      })
      .catch((err) => {
        req.flash('error', 'Error saving to database.');
        console.error(err);
        res.redirect('/');
      });
  })
  .get('/s', (req, res) => {
    res.send(req.session);
  })
  .listen(secrets.port, () => {
    console.log(`Server listening on port ${secrets.port}... (${app.get('env')})`);
  });
