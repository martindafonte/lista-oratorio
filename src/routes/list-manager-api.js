const express = require('express');
const router = express.Router();


router.route("/")
    //Crear un nuevo checklist
    .post((request, response) => {
        
        response.send('No implementado aún');
    })

router.route("/close").post(
    (request, response) => {
        console.log(JSON.stringify(request.body));
        response.send('No implementado aún');
    }
)

module.exports = router;