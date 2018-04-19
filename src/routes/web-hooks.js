const express = require('express');

const router = express.Router();

router.get("/:id", (request, response) => {
  //TODO chequear si existe webhook id registrado
  console.log('Recibido request GET para id: ' + request.params.id);
  response.status(200).send('Exito');
});

router.post("/:id", (request, response) => {
  console.log('Recibido request POST para id: ' + request.params.id);
  console.log('Request body:' + request.body);
  //Procesar Web hook
  response.sendStatus(200)
});


module.exports = router;