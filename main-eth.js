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
// Ethereum Utility
// ================================================================================

let ethUtil = require('ethereumjs-util');
var data = 'i am a string';
// Elliptic curve signature must be done on the Keccak256 Sha3 hash of a piece of data.
var message = ethUtil.toBuffer(data);
var msgHash = ethUtil.hashPersonalMessage(message);
var sig = ethUtil.ecsign(msgHash, privateKey);
var serialized = ethUtil.bufferToHex(this.concatSig(sig.v, sig.r, sig.s))
return serialized;

// ================================================================================
// Ethereum post authenticate
// ================================================================================

var jwt = require('jsonwebtoken');
function checkSig(req, res) {
  let sig = req.sig;
  let owner = req.owner;
  // Same data as before
  let data = 'i am a string';
  let message = ethUtil.toBuffer(data);
  let msgHash = ethUtil.hashPersonalMessage(message);
  // Get the address of whoever signed this message
  let signature = ethUtil.toBuffer(sig);
  let sigParams = ethUtil.fromRpcSig(signature);
  let publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
  let sender = ethUtil.publicToAddress(publicKey);
  let addr = ethUtil.bufferToHex(sender);

  // Determine if it is the same address as 'owner'
  let match = false;
  if (addr == owner) { match = true; }
  if (match) {
    // If the signature matches the owner supplied, create a
    // JSON web token for the owner that expires in 24 hours.
    var token = jwt.sign({user: req.body.addr}, 'i am another string',  { expiresIn:"1d"});
    res.send(200, { success: 1, token: token });
  } else {
    // If the signature doesn’t match, error out
    res.send(500, { err: 'Signature did not match.'});
  }
}

// ================================================================================
// Database and objects
// ================================================================================

// Database of short URL keys and the long URLS
let urlDatabase = {
    "b2xVn2": {url: "http://www.lighthouselabs.ca", userID: "dave" },
    "9sm5xK": {url: "http://www.google.com", userID: "userRandomID"}
};

// let urlDatabase = {
//   "b2xVn2": {shortURL:  url: "http://www.lighthouselabs.ca", userID: "dave" },
//   "9sm5xK": {url: "http://www.google.com", userID: "userRandomID"}
// };


// Users object
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "one@example.com",
    password: "1"
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
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    user_id: req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});

// form urls_new to create/add new shortened URLs
app.get('/urls/new', (req, res)=>{
  let user_id = req.cookies['user_id'];
  let templateVars = {
    user: users[user_id],
  };
  if (user_id){
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
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

app.get("/u/:shortURL", (req, res) => {
  let templateVars =  {
    users: users,
    user_id: req.cookies['user_id']
  };
  let longURL = urlDatabase[req.params.shortURL].url;
  if (longURL) {
    res.redirect(longURL, templateVars);
  } else {
    res.send('Not Found!');
  }
});

// app.get('/urls/:id', (req, res)=>{
//   let templateVars =  {
//     shortURL: req.params.id,
//     longURL: urlDatabase[req.params.id],
//     //users: users,
//     user_id: req.cookies['user_id']
//   };
//   res.render('urls_show', templateVars);
// });

app.get('/urls/:id', (req, res)=>{
  let templateVars =  {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    // users: users,
    user_id: req.cookies['user_id']

  };
  if (belongsToUser(req.cookies['user_id'], req.params.id)){
    res.render('urls_show', templateVars);
  } else {
    res.send('You have to log in!')
  }
});

//create a function that tests if IDs are the same
function belongsToUser(userid, dbuserid){
  for (var key in urlDatabase[dbuserid]) {
    if (userid === urlDatabase[dbuserid].userID) {
    return true;
    }
  }
return false;
}

// ================================================================================
// Unused get requests
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
  let auth;
  for (var KEY in users) {
    if (users[KEY].email === email && users[KEY].password === password) {
      res.cookie('user_id', users[KEY].id);
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
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Post route that shortens URL
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = {url: req.body.longURL, userID: req.cookies['user_id']};
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
    if (req.cookies['user_id'] === urlDatabase[KEY].userID) {
      delete urlDatabase[KEY];
    }
  }
  res.redirect('/urls')
})


// ================================================================================
// Ethereum auth routes
// ================================================================================

app.post('/UpdateData', auth, Routes.UpdateData);

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

// Middleware/auth.js function
function auth(req, res, next) {
  jwt.verify(req.body.token, 'i am another string', function(err, decoded) {
    if (err) { res.send(500, { error: 'Failed to authenticate token.'}); }
    else {
      req.user = decoded.user;
      next();
    };
  });
}

// Note that the middleware modifies the request.
function UpdateData(req, res) {
  // Only use the user that was set in req by auth middleware!
  var user = req.user;
  updateYourData(user, req.body.data);
}
// Athenticate code
authenticate(sig, user) {
  return (dispatch) => {
    fetch(`${this.api}/Authenticate`, {
      method: 'POST',
      body: JSON.stringify({ owner: user, sig: sig}),
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => { return res.text(); })
      .then((body) => {
        var token = JSON.parse(body).token;
        dispatch({ type: 'SET_AUTH_TOKEN', result: token})
      })
  }
}

// Signature deconstruction
var solidity_sha3 = require('solidity-sha3').default;
let hash = solidity_sha3(data);
let sig = result.result.substr(2, result.result.length);
let r = sig.substr(0, 64);
let s = sig.substr(64, 64);
let v = parseInt(sig.substr(128, 2));