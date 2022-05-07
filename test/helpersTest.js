const { assert } = require('chai');

const { getUserByEmail, generateRandomString, findLongURL, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: 'userRandomID'
  },
  'as3df2': {
    longURL: "https://www.reddit.com",
    userID: 'randomUser'
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.equal(user, expectedUserID);
  });
  
  it('should return a undefined with invalid email', () => {
    const user = getUserByEmail('user5@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

describe('urlsForUser', () => {
  it('should return an object based on the userID', () => {
    const userURLS = urlsForUser('userRandomID', testDatabase);
    const expectedResults = {
      'b2xVn2': {
        longURL: "http://www.lighthouselabs.ca",
        userID: 'userRandomID'
      },
      '9sm5xK': {
        longURL: "http://www.google.com",
        userID: 'userRandomID'
      }
    };
    assert.deepEqual(userURLS, expectedResults);
  });

  it('should return empty object if user is not in the database', () => {
    const userURLs = urlsForUser('testID', testDatabase);
    assert.deepEqual(userURLs, {});
  });
});

describe('generateRandomString', () => {
  it('should create a random string with 6 values', () => {
    assert.equal(generateRandomString().length, 6);
  });
});

describe('findLongURL', () => {
  it('should return a longURL', () => {
    const longURL = findLongURL('as3df2', testDatabase);
    const expectedURL = 'https://www.reddit.com';
    assert.equal(longURL, expectedURL);
  });

  it('should return undefined with invalid shortURL', () => {
    const longURL = findLongURL(undefined, testDatabase);
    assert.equal(longURL, undefined);
  });
});