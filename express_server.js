const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// for creating short URLs / user_id
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

// find user_id by email
const findUser = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
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

app.get('/login', (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = { user: users[user] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  if (!findUser(req.body.email)) {
    res.status(403).send('User does not exist');
  } else if (findUser(req.body.email) && req.body.password !== users[findUser(req.body.email)].password) {
    res.status(403).send('Incorrect password');
  } else {
    res.cookie('user_id', findUser(req.body.email));
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user]
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
  const user = req.cookies.user_id;
  const templateVars = { user: users[user] };
  res.render('urls_new', templateVars);
});

// route to individual short url
app.get('/urls/:shortURL', (req, res) => {
  const user = req.cookies.user_id;
  // shortURL is the key, and longURL is the value
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[user]
  };
  res.render("urls_show", templateVars);
});

// handle shortURL request, redirect to long
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// edit a longURL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// delete a url resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete(urlDatabase[shortURL]);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// to registration
app.get('/register', (req, res) => {
  const user = req.cookies.user_id;
  const templateVars = { user: users[user] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please input your email/password');
  } else if (findUser(req.body.email)) {
    res.status(400).send('User already exists');
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', users[userID].id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});