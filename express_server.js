const express = require('express');
const app = express();
const PORT = 8080;

// for post req. body-parser will convert the req body from a buffer into a string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

// routes
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls')
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
});

// posting a new longURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] }
  res.render('urls_new', templateVars);
});

// route to specific short urls
app.get('/urls/:shortURL', (req, res) => {
  // shortURL is the key, and longURL is the value
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

// handle shortURL request, redirect to long
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// edit a longURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls')
});

// delete a url resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete(urlDatabase[shortURL])
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});