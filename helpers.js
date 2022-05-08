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

// return object of urls for a particular user
const urlsForUser = (id, database) => {
  let userURLS = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userURLS[url] = database[url];
    }
  }
  return userURLS;
};

// find a long url using short url
const findLongURL = (shortURL, database) => {
  for (let url in database) {
    if (shortURL === url) {
      return database[url].longURL;
    }
  }
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  findLongURL
};