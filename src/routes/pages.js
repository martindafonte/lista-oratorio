module.exports = (app) => {
  app.get('/', require('./../views/pages/index/index'));
}