// On importe mongoose :
const mongoose = require("mongoose");

// On importe le package mongoose-unique-validator.
// Avec unique : true, on peut avoir des erreurs un peu illisibles de la part de mongodb.
// Le package mongoose-unique-validator va nous faciliter cette tâche.
// Il va prévalider les informations avant de les enregistrer :
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  // Avec unique : true, il sera impossible de s'inscrire plusieurs fois avec le même email :
  email: { type: String, required: true, unique: true },
  // Même le hash (le mot de passe crypté) sera de type string :
  password: { type: String, required: true },
});

// On rajoute le validateur comme plugin à notre schéma avant d'en faire un modèle :
userSchema.plugin(uniqueValidator);

// On exporte ce schéma comme modèle :
module.exports = mongoose.model("User", userSchema);
