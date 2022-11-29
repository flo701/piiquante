// On importe le package validator qui est une bibliothèque qui valide et nettoie les chaînes de caractères :
const validator = require("validator");

// Le middleware suivant va nous premettre de contrôler la validité de l'email entré dans la requête :
module.exports = (req, res, next) => {
    // Si l'email est valide, on passe à la suite :
    if (validator.isEmail (req.body.email)) { 
        next ()
     } else {
        // Sinon on retourne un code 400 (Bad Request) avec un message d'erreur :
        return res
        .status (400)
        .json 
        ({error : `The email ${req.body.email} is not valid`} )
    }
}