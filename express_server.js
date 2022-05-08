const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const { generateRandomString, getUserByEmail, urlsForUser, findLongURL } = require('./helpers');
const { urlDatabase, users } = require('./constants');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['randomKey1', 'randomKey2'],
}));

// routes
app.get('/', (req, res) => {
  res.redirect('/');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/login', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user: users[user] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, users[user].password)) {
    res.status(403).send('Incorrect username or password');
  } else {
    req.session.userId = user;
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const user = req.session.userId;
  
  const templateVars = {
    urls: urlsForUser(user, urlDatabase),
    user: users[user]
  };

  !user ? res.redirect(401, 'login') : res.render("urls_index", templateVars);
});


// posting a new longURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const user = req.session.userId;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user
  };

  !user ? res.redirect(401, 'login') : res.redirect(`/urls/${shortURL}`);
});

// page to create a new short url. if a user is not logged in, redirect to login
app.get('/urls/new', (req, res) => {
  const user = req.session.userId;
  const templateVars = { user: users[user] };

  !user ? res.redirect('/login') : res.render('urls_new', templateVars);
});

// route to individual short url
app.get('/urls/:shortURL', (req, res) => {
  const user = req.session.userId;
  const shortURL = req.params.shortURL;
  
  if (!user) {
    res.redirect(401, 'login');
  } else if (user !== urlDatabase[shortURL].userID) {
    res.status(403).send('You do not own this Tiny URL');
  } else {
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[user]
    };
    res.render("urls_show", templateVars);
  }
});

// handle shortURL request, link to long url if it exists
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = findLongURL(shortURL, urlDatabase);
  
  longURL ? res.redirect(longURL) : res.status(404).send('Invalid URL');
});

// edit a longURL
app.post('/urls/:shortURL', (req, res) => {
  const user = req.session.userId;
  const shortURL = req.params.shortURL;
  
  if (user !== urlDatabase[shortURL].userID) {
    res.redirect(403, 'login');
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

// delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session.userId;
  const shortURL = req.params.shortURL;

  if (user !== urlDatabase[shortURL].userID) {
    res.status(403).send('You do not own this Tiny URL');
  } else {
    delete(urlDatabase[shortURL]);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// to registration
app.get('/register', (req, res) => {
  const user = req.session.userId;
  const templateVars = { user: users[user] };
  res.render('register', templateVars);
});

// new registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password) {
    res.redirect(400, 'register');
  } else if (user) {
    res.redirect(400, 'login');
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    req.session.userId = users[userID].id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});