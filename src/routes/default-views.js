module.exports = (app) => {
  app.get('/', (request, response) => {
    response.render('index', { board_id: process.env.board_id });
  });
}