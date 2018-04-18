
let routes = (app) => {

  // Simple in-memory store
  const dreams = [
    "Find and count some sheep",
    "Climb a really tall mountain",
    "Wash the dishes"
  ]

  app.get("/dreams", (request, response) => {
    response.send(dreams)
  })

  app.post("/dreams", (request, response) => {
    dreams.push(request.query.dream)
    response.sendStatus(200)
  })
}

module.exports = routes;