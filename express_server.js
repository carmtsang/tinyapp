const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs')

const { generateRandomString, getUserByEmail, urlsForUser, findLongURL } = require('./helpers');
const { urlDatabase, users } = require('./constants');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  //cookie options
  maxAge: 24 * 60* 60 * 1000 //24 hours
}));

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
  const user = req.session.user_id;
  const templateVars = { user: users[user] };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email
  const user = getUserByEmail(req.body.email, users);

  if (!user) {
    return res.status(403).send('User does not exist');
  } else if (user && !bcrypt.compareSync(password, users[user].password)) {
    return res.status(403).send('Incorrect password');
  } else {
    req.session.user_id = user;
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const user = req.session.user_id;
  
  const templateVars = {
    urls: urlsForUser(user),
    user: users[user]
  };
  !user ? res.status(401).send('Login or register to TinyApp to see URLs') : res.render("urls_index", templateVars);
});

// posting a new longURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const user = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user
  }
  !user ? res.status(401).send('Login to TinyApp required') : res.redirect(`/urls/${shortURL}`);
});

// page to create a new short url. if a user is not logged in, redirect to login
app.get('/urls/new', (req, res) => {
  const user = req.session.user_id;
  const templateVars = { user: users[user] };

  !user ? res.redirect('/login') : res.render('urls_new', templateVars);
});

// route to individual short url
app.get('/urls/:shortURL', (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL
  
  if (!user) {
    res.status(401).send('Login to TinyApp required')
  } else if (user !== urlDatabase[shortURL].userID) {
    res.status(403).send('You do not own this shortURL')
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
  const longURL = findLongURL(shortURL);
  
  longURL ? res.redirect(longURL) : res.status(404).send('Invalid URL')
});

// edit a longURL - only users can edit their own urls
app.post('/urls/:shortURL', (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (user !== urlDatabase[shortURL].userID) {
    res.status(403).send('You do not own this shortURL')
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

// delete a url resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (user !== urlDatabase[shortURL].userID) {
    res.status(403).send('You do not own this shortURL')
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
  const user = req.session.user_id;
  const templateVars = { user: users[user] };
  res.render('register', templateVars);
});

// new registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send('Please input your email/password');
  } else if (user) {
    res.status(400).send('User already exists');
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = users[userID].id
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});