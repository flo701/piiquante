// On importe express :
const express = require("express");

// On crée un routeur Express :
const router = express.Router();

// On importe le middleware password :
const password = require ("../middlewares/password");

// On importe le middleware email :
const email = require ("../middlewares/email");

// On importe le contrôleur user pour associer les fonctions aux différentes routes :
const userCtrl = require("../controllers/user");

// Les routes fournies sont celles prévues par l'application front-end.
// Le segment de route indiqué ici est uniquement le segment final,
// car le reste de l'adresse de la route est déclaré dans notre application Express :
router.post("/signup", email, password, userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
