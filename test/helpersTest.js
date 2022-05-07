const { assert } = require('chai');

const { getUserByEmail, generateRandomString } = require('../helpers.js');

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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers)
    const expectedUserID = 'userRandomID'
    assert.equal(user, expectedUserID);
  })
})

describe('getUserByEmail', () => {
  it('should return a undefined with invalid email', () => {
    const user = getUserByEmail('user5@example.com', testUsers)
    const expectedUserID = 'userRandomID'
    assert.equal(user, undefined);
  })
})

describe('generateRandomString', () => {
  it('should create a random string with 6 values', () => {
    
    assert.equal(generateRandomString().length, 6);
  })
})


