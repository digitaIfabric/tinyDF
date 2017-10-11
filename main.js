'use_strict;'
// ================================================================================
// Initialization
// ================================================================================
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    var NUM ='';
    var CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 1; i <= 6; i++){
        NUM += CDS.charAt(Math.floor(Math.random() * CDS.length));
    }
    return "DF" + NUM;
}

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/", (req, res) => {
    res.end("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res)=>{
    res.render('urls_new');
});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(302, '/urls/'+shortURL);
});

//POST route that removes a URL resource:
app.post('/urls/:id/delete', (req, res)=>{
    var deletedURL = req.params.id;
    delete urlDatabase[deletedURL];
    res.redirect('/urls');
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});