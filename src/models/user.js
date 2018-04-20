module.exports = class User {
  constructor(id, api_key, token) {
    this.di = id;
    this.api_key = api_key;
    this.token = token;
  }
}