// ================================================================================
// Initialization and require
// ================================================================================

'use_strict;'
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const cookieSession = require('cookie-session');
const path = require('path');

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({extended: true}));

// View engine
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'));

// ================================================================================
// Database and objects
// ================================================================================

// Database of short URL keys and the long URLS
let urlDatabase = {
    "b2xVn2": {url: "http://www.lighthouselabs.ca", userID: 'dave' },
    "9sm5xK": {url: "http://www.google.com", userID: 'userRandomID'}
};

// Users object
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "one@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
  'dave': {
    id: 'dave',
    email: "dwawryko@gmail.com",
    password: bcrypt.hashSync("123456", saltRounds)
  },
  "A": {
    id: "A",
    email: "A@gmail.com",
    password: bcrypt.hashSync("A", saltRounds)
  }
};

// ================================================================================
// Get requests
// ================================================================================

// Hello page
app.get('/', (req, res)=>{
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Sending urlDatabase data within the urls key
app.get("/urls", (req, res) => {
  let templateVars = {
      users: users,
      urls: urlsForUser(req.session.user_id),
      user_id: req.session.user_id
    }
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.send("You have to login");
  }
});

// form urls_new to create/add new shortened URLs
app.get('/urls/new', (req, res)=>{
  let templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  if (users[req.session.user_id].email){
    res.render("urls_new", { users: users, user_id: req.session['user_id'] });
    //{name: req.cookies.username}
  } else {
    res.redirect("/login");
  }
});

// Returns registration page
app.get("/register", (req, res) => {
  let templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  if (!users[req.session.user_id].email) {
    res.render('register', templateVars);
  } else {
  res.redirect("/urls");
  }
});

// Create a Login Page
app.get('/login', (req, res)=>{
  res.render('login');
});

// Redirect
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  if (longURL) {
    res.redirect(302, longURL);
  } else {
    res.send('Not Found!');
  }
});

app.get('/urls/:id', (req, res)=>{
  let templateVars =  {
    users: users,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    // users: users,
    user_id: req.session.user_id

  };
  if (belongsToUser(req.session.user_id, req.params.id)){
    res.render('urls_show', templateVars);
  } else {
    res.send('You have to log in!');
  }
});

// ================================================================================
// Post Requests
// ================================================================================

// Register new user object in the global users
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
      var user_id = generateRandomString();
      var email = req.body.email;
      var password = req.body.password;
      req.session.user_id = user_id;
      users[user_id] = { id:user_id, email:email, password: bcrypt.hashSync(password, 10)};
      res.redirect('/urls');
  } else {
    res.status(400).send('Please provide email and password.');
  }
});

// Login post request
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let auth;
  for (var KEY in users) {
    if (users[KEY].email === email && bcrypt.compareSync(password, users[KEY].password)) {
      req.session.user_id = users[KEY].id;
      res.redirect('/urls');
      auth = true;
    };
  };
  if (!auth) {
    res.status(403).send('User with that email not found.');
  }
});

// Logout post request (logout handler)
app.post('/logout', (req, res) => {
  //res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect('/urls');
});

// Post route that shortens URL
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = {url: req.body.longURL, userID: req.session.user_id};
    res.redirect(302, '/urls/'+shortURL);
});

// Post route that updates a URL resource
app.post('/urls/:id', (req, res)=>{
  var updatedURL = req.body.updatedURL;
  let auth;
  //console.log(updatedURL);
  var shortURL = req.params.id;
  //console.log(shortURL);
  for (var KEY in urlDatabase[shortURL]) {
    urlDatabase[shortURL].url = updatedURL;
    res.redirect('/urls/'+shortURL);
  }
});

//Post route that removes a URL resource:
app.post('/urls/:id/delete', (req, res)=>{
  var deletedURL = req.params.id;
  for (var KEY in urlDatabase) {
    if (req.session.user_id === urlDatabase[KEY].userID) {
      delete urlDatabase[KEY];
    }
  }
  res.redirect('/urls')
})

// ================================================================================
// Server listen
// ================================================================================

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

// ================================================================================
// Functions
// ================================================================================

// Generate alphanumeric string
function generateRandomString() {
  let NUM ='';
  let CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let length = 6;
  for (var i = 0; i < length; i++){
    NUM += CDS.charAt(Math.floor(Math.random() * (CDS.length + 1) ));
  }
  let POS = Math.floor(Math.random() * length)+1;
  let result = NUM.substr(0, POS) + "DF" + NUM.substr(POS);
  return result;
}

// Returns subset of URL database that belongs to users email
function urlsForUser(id){
  var specificDatabase =  {};
  for (var KEY in urlDatabase) {
    if (urlDatabase[KEY].userID === id) {
      specificDatabase[KEY] = {url: urlDatabase[KEY].url, userID: urlDatabase[KEY].userID}
    }
  }
  return specificDatabase;
}

//create a function that tests if IDs are the same
function belongsToUser(userid, dbuserid){
  for (var key in urlDatabase[dbuserid]) {
    if (userid === urlDatabase[dbuserid].userID) {
      return true;
    }
  }
  return false;
}