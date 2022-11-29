// On importe mongoose pour créer un schéma de Sauce :
const mongoose = require("mongoose");

// Nous créons un schéma de données qui contient les champs souhaités pour chaque Sauce,
// qui indique leur type ainsi que leur caractère (obligatoire ou non).
// Pour cela, on utilise la méthode Schema mise à disposition par Mongoose.
// Inutile de mettre un champ pour l'Id puisqu'il est automatiquement généré par Mongoose :
const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true},
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number },
  dislikes: { type: Number },
  usersLiked: { type: ["String<userId>"] },
  usersDisliked: { type: ["String<userId>"] },
});

// Ensuite, nous exportons ce schéma en tant que modèle Mongoose appelé « Sauce »,
// le rendant par là même disponible pour notre application Express :
module.exports = mongoose.model("Sauce", sauceSchema);
