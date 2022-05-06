const { urlDatabase, users } = require('./constants');

// for creating short URLs / user_id
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// find user_id by email
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
};

// return array of urls for a particular user
const urlsForUser = id => {
  let userURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLS[url] = urlDatabase[url]
    }
  }
  return userURLS
}

// find a long url using short url
const findLongURL = shortURL => {
  for (let url in urlDatabase) {
    if (shortURL === url) {
      return urlDatabase[url].longURL
    }
  }
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  findLongURL
}