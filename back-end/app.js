// On importe express :
const express = require("express");

// On appelle la méthode express, ce qui permet de créer une application express :
const app = express();

// On importe helmet qui aide à sécuriser les applications Express en définissant divers en-têtes HTTP :
const helmet = require("helmet");

// On importe express-rate-limit qui permer de limiter le nombre de requêtes que peut faire un client :
const rateLimit = require("express-rate-limit");

// On va appliquer la limite suivante aux routes "sauces" :
const limiter1 = rateLimit({
  windowMs: 10 * 60 * 1000, // Equivalent de 10 minutes
  max: 100, // Le client pourra donc faire 100 requêtes toutes les 10 minutes
  message : "Too many requests, please try again in 10 minutes."
});

// On va appliquer la limite suivante aux routes "auth" :
const limiter2 = rateLimit({
  windowMs: 10 * 60 * 1000, // Equivalent de 10 minutes
  max: 50, // le client pourra faire 50 requêtes toutes les 10 minutes
  message: "Too many requests, please try again in 10 minutes."
});

// On importe mongoose qui est un package qui facilite les interactions avec notre base de données MongoDB.
// Il nous permet de :
// valider le format des données ;
// gérer les relations entre les documents ;
// communiquer directement avec la base de données pour la lecture et l'écriture des documents.
const mongoose = require("mongoose");

// On importe nos routes sauce et user :
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// On accède au path de notre serveur :
const path = require("path");

// On importe dotenv pour pouvoir utiliser les variables d'environnement 
// (pour le port, mongoose.connect, user.js (login), et auth.js) :
require("dotenv").config();

// On connecte notre API à notre base de données MongoDB :
mongoose
  .connect(
    // Faire un copier/coller de la chaîne de caractères trouvée sur mongodb,
    // dans "connect", "connect your application" :
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.62czg.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))           
  .catch((error) => console.log("Connexion à MongoDB échouée : " + error));
  
// Ce middleware va permettre d'extraire le corps JSON des requêtes POST et PUT venant du front-end :
app.use(express.json());

// On enregistre helmet en désactivant le middleware crossOriginResourcePolicy :
app.use(helmet({crossOriginResourcePolicy: false,}));

// Les headers suivants permettent :
//    - d'accéder à notre API depuis n'importe quelle origine ( '*' )
// (afin d'éviter les erreurs de CORS.
// Dans notre cas, nous avons deux origines : localhost:3000 et localhost:4200,
// et nous souhaitons qu'elles puissent communiquer entre elles) ;
//    - d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
//    - d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.) :
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// On enregistre les routes sauce et user.
// Le 1er argument est l'URL demandée par l'application front-end,
// ce qu'on appelle le end-point ou la route sur notre API.
// L'URL est http://localhost:3000/api/sauces ou http://localhost:3000/api/auth
// mais il ne nous faut ici que les extensions :
app.use("/api/sauces", limiter1, sauceRoutes);
app.use("/api/auth", limiter2, userRoutes);

// Nous devons indiquer à notre app.js comment traiter les requêtes vers la route /images,
// en rendant notre dossier images statique.
// Cela indique à Express qu'il faut gérer la ressource images de manière statique
// (un sous-répertoire de notre répertoire de base, __dirname)
// à chaque fois qu'elle reçoit une requête vers la route /images :
app.use("/images", express.static(path.join(__dirname, "images")));

// On exporte l'application express
// pour pouvoir y accéder depuis les autres fichiers de notre projet, notamment le serveur :
module.exports = app;
