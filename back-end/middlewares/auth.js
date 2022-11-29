// On importe le package jsonwebtoken, 
// grâce auquel on peut générer un token permettant un échange sécurisé de données entre notre API et l'utilisateur :
const jwt = require("jsonwebtoken");

// Le middleware suivant va vérifier que l’utilisateur est bien connecté 
// et va transmettre les informations de connexion aux différentes méthodes qui vont gérer les requêtes.
// Étant donné que de nombreux problèmes peuvent se produire,
// nous insérons tout à l'intérieur d'un bloc try...catch :
module.exports = (req, res, next) => {
  try {
    // Nous extrayons le token du header Authorization de la requête entrante.
    // Il contiendra également le mot-clé Bearer.
    // Nous utilisons donc la fonction split pour tout récupérer après l'espace dans le header :
    const token = req.headers.authorization.split(" ")[1];
    // Nous utilisons ensuite la fonction verify pour décoder notre token, pour vérifier sa validité :
    // ("iat" : date à laquelle à été créé le jeton (issued at), "exp" : date d'expiration du jeton)
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
    console.log("Token décodé : " + JSON.stringify(decodedToken))
    // Nous extrayons l'ID utilisateur de notre token
    // et le rajoutons à l’objet Request afin que nos différentes routes puissent l’exploiter :
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    // Dans le cas où tout fonctionne et notre utilisateur est authentifié,
    // nous passons à l'exécution de la requête à l'aide de la fonction next() :
    next();
  } catch (error) {
    // En cas d'erreur, nous renvoyons un code 401 (Unauthorized) :
    res.status(401).json({ error });
  }
};
