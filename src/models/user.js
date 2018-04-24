module.exports = class User {
  constructor(username, api_key, token) {
    this.username = username;
    this.api_key = api_key;
    this.token = token;
  }
}