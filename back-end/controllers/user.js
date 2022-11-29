// On importe bcrypt qui permet de hacher les mots de passe :
const bcrypt = require("bcrypt");

// On importe le package jsonwebtoken qui va nous permettre de créer des tokens et de les vérifier :
const jwt = require("jsonwebtoken");

// On importe le modèle User :
const User = require("../models/User");

// ---------------------------------------------------------------------------------------------------------------
// Inscription de nos utilisateurs :
exports.signup = (req, res, next) => {
  // On hash (crypte) le mot de passe grâce à bcrypt.
  // Le "salt" (sel) 10 c'est le nombre de fois que l'on exécute l'algorithme de hashage.
  // Il s'agit d'une fonction asynchrone qui renvoie une "promise" dans laquelle nous recevons le hash généré :
  bcrypt
    .hash(req.body.password, 10)
    // On va créer un nouveau user avec ce mot de passe crypté et l'email passé dans le corps de la requête :
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // On va enregistrer cet utilisateur dans la base de données :
      user
        .save()
        // Le code 201 (Created) indique que la requête a réussi
        // et qu'une nouvelle ressource a été créée en guise de résultat :
        .then(() => res.status(201).json({ message: "User created and registered !" }))
        .catch((error) => {
          // Si l'adresse email est déjà enregistrée dans notre base de données,
          // on renvoie un code 400 (Bad Request),
          // et le plugin mongoose-unique-validator (appliqué au modèle User) renvoie un message d'erreur :
          res.status(400).json({ error });
        });
    })
    .catch((error) => 
    // Le code 500 (Internal Server Error)
    // indique que le serveur a rencontré une situation qu'il ne sait pas gérer :
    res.status(500).json({ error })) 
};

// ---------------------------------------------------------------------------------------------------------------
// Connexion de nos utilisateurs :
exports.login = (req, res, next) => {
  // Nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur
  // correspond à un utilisateur existant de la base de données.
  // Dans le cas contraire, nous renvoyons un code 401 (Unauthorized),
  // (plus précisément, cela signifie que l'utilisateur n'est pas authentifié) :
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "email not found" });
      }
      // Si l'e-mail correspond à un utilisateur existant, nous continuons.
      // Nous utilisons la fonction compare de bcrypt
      // pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données.
      // S'ils ne correspondent pas,
      // nous renvoyons une erreur 401 (Unauthorized).
      // S'ils correspondent, les informations d'identification de notre utilisateur sont valides.
      // Dans ce cas, nous renvoyons un code 200, ainsi que l'Id utilisateur et un token :
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Wrong email and password combination" });
          }
          res.status(200).json({
            userId: user._id,
            // Nous utilisons la fonction sign de jsonwebtoken pour chiffrer un nouveau token.
            // Ce token contient l'Id de l'utilisateur en tant que payload (les données encodées dans le token).
            // Nous utilisons une clé secrète pour crypter notre token.
            // Nous définissons la durée de validité du token à 1 heure.
            // L'utilisateur devra donc se reconnecter au bout d'1 heure.
            token: jwt.sign({ userId : user._id }, process.env.RANDOM_TOKEN_SECRET, {
              expiresIn: "1h",
            }),
          });
        })
        .catch((error) => {
          // En cas d'erreur (par exemple une clé secrète sans valeur), on renvoie un code 500 : 
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
    res.status(500).json({ error });
    });
};
