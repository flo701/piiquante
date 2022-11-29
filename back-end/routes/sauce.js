// On importe express :
const express = require("express");

// Nous créons un routeur Express.
// Plutôt que d'enregistrer nos routes directement dans notre application,
// nous allons les enregistrer dans notre routeur Express,
// puis enregistrer celui-ci dans l'application :
const router = express.Router();

// On importe le middleware auth que l'on va appliquer à toutes nos routes "sauces" qui doivent être protégées :
const auth = require("../middlewares/auth");

// On importe le middleware multer 
// que l'on va appliquer à nos requêtes POST et PUT où le traitement de fichiers est nécessaire :
const multer = require("../middlewares/multer");

// On importe le contrôleur sauce :
const sauceCtrl = require("../controllers/sauce");

// ----------------------------------------------------------------------------------------------------------------
// On enregistre les différentes fonctions "sauce" 
// (nous avons ici le segment final de l'adresse de la route, le reste est déclaré dans app.js) :
router.get("/", auth, sauceCtrl.getAllSauces);

// Nous utilisons : en face du segment dynamique de la route pour la rendre accessible en tant que paramètre.
// Les : disent à l'application express que cette partie sera dynamique :
router.get("/:id", auth, sauceCtrl.getOneSauce);

router.post("/", auth, multer, sauceCtrl.createSauce);

router.put("/:id", auth, multer, sauceCtrl.modifySauce);

router.delete("/:id", auth, sauceCtrl.deleteSauce);

router.post("/:id/like", auth, sauceCtrl.likeSauce);

// ----------------------------------------------------------------------------------------------------------------
// On exporte notre routeur pour pouvoir l'utiliser depuis app.js :
module.exports = router;
