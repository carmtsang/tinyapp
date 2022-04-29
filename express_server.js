const express = require('express');
const app = express();
const PORT = 8080; 

// for post req. body-parser will convert the req body from a buffer into a string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
}

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

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// posting a new longURL
app.post('/urls', (req, res) => {
  console.log(req.body); // log the POST request body to the console
  res.send('Ok'); //respond with 'ok'
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

//route to specific short urls
app.get('/urls/:shortURL', (req, res) => {
  // shortURL is the key, and longURL is the value
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});