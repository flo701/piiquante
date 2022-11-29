// On importe password-validator :
const passwordValidator = require ("password-validator")

// On crée un schéma :
const passwordSchema = new passwordValidator();

// Schéma que doit respecter le mot de passe :
passwordSchema
.is().min(8)                                    // 8 caractères minimum
.is().max(25)                                   // 25 caractères maximum
.has().uppercase()                              // Au moins 1 lettre majuscule
.has().lowercase()                              // Au moins 1 lettre minuscule
.has().digits(2)                                // Au moins 2 chiffres
.has().not().spaces()                           // Pas d'espace
.is().not().oneOf(['Passw0rd', 'Password123']); // Valeurs blacklistées

// Comparaison du password avec le schéma :
module.exports = (req,res,next)=> {
    // Si le schéma est respecté, on passe à la fontion suivante :
    if (passwordSchema.validate (req.body.password)) { 
        next ()
     } else {
        // Sinon on retourne un code 400 (Bad Request) avec un message d'erreur indiquant les règles qui ont échoué :
        console.log
        ("Règles qui ont échoué : " 
        + passwordSchema.validate(req.body.password, { list: true }));
        return res
        .status (400)
        .json 
        ({error : "The password is not strong enough : " + JSON.stringify(passwordSchema.validate(req.body.password,{ details:true }))})  
    }

}