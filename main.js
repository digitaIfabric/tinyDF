// ================================================================================
// Initialization and Require
// ================================================================================

'use_strict;'
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// View engine
app.set("view engine", "ejs")

// ================================================================================
// Database and objects
// ================================================================================

// Database of short URL keys and the long URLS
let urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

// Users object
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "dave": {
    id: "dave",
    email: "dwawryko@gmail.com",
    password: "123456"
  }
};


// ================================================================================
// Get requests
// ================================================================================

// Hello page
app.get("/", (req, res) => {
  res.end("Hello!");
});

// Sending urlDatabase data within the urls key
app.get('/urls', (req, res)=>{
  let templateVars =  {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies['user_id']
  };
  res.render('urls_index', templateVars);
});

// Get request form urls_new to create/add shortURLs
app.get('/urls/new', (req, res)=>{
  let templateVars = {
    users: users,
    user_id: req.cookies['user_id']
  };
  res.render('urls_new', templateVars);
});

// Returns registration page
app.get("/register", (req, res) => {
  let templateVars = {
    users: users,
    user_id: req.cookies['user_id']
  };
  res.render('register', templateVars);
});

// Create a Login Page
app.get('/login', (req, res)=>{
  res.render('login' /*templateVars*/);
});

app.get("/urls", (req, res) => {
    let templateVars = {
      urls: urlDatabase,
      users: users,
      user_id: req.cookies['user_id']
    };
    res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res)=>{
    let templateVars = {
      users: users,
      user_id: req.cookies['user_id']
    };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars =  {
    users: users,
    user_id: req.cookies['user_id']
  };
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL, templateVars);
  } else {
    res.send('Not Found!');
  }
});

app.get('/urls/:id', (req, res)=>{
  let templateVars =  {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    users: users,
    user_id: req.cookies['user_id']
  };
  res.render('urls_show', templateVars);
});

// ================================================================================
// Unused gets
// ================================================================================

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // app.get("/hello", (req, res) => {
//     res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

// ================================================================================
// Post Requests
// ================================================================================

// Register new user object in the global users
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
      var user_id = generateRandomString();
      var email = req.body.email;
      var password = req.body.password;
      res.cookie('user_id', user_id);
      users[user_id] = { id:user_id, email:email, password:password};
      res.redirect('/urls');
  } else {
    res.status(400).send('Please provide email and password');
  }
});

// Login post request
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (var KEY in users) {
    if (users[KEY].email === email && users[KEY].password === password) {
      console.log('If');
      res.cookie('user_id', users[KEY].id);
      res.redirect('/urls');
    }
  }
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
});

// Logout post request
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Post route that shortens URL
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(302, '/urls/'+shortURL);
});

// Post route that updates a URL resource
app.post('/urls/:id', (req, res)=>{
  var updatedURL = req.body.updatedURL;
  var shortURL = req.params.id;
  urlDatabase[shortURL] = updatedURL;
  res.redirect('/urls/'+shortURL);
})

//Post route that removes a URL resource:
app.post('/urls/:id/delete', (req, res)=>{
    var deletedURL = req.params.id;
    delete urlDatabase[deletedURL];
    res.redirect('/urls');
});




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
  var NUM ='';
  var CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 6; i++){
    NUM += CDS.charAt(Math.floor(Math.random() * (CDS.length + 1) ));
  }
  var POS = Math.floor(Math.random() * 6)+1;
  var result = NUM.substr(0, POS) + "DF" + NUM.substr(POS);
  return result;
}