// On importe multer, un package qui nous permet de gérer les fichiers entrants dans les requêtes HTTP :
const multer = require("multer");

// On crée un dictionnaire, qui sera un objet, avec les "mime types" que l'on peut avoir depuis le front-end :
 const MIME_TYPES = {
   "image/jpg": "jpg",
   "image/jpeg": "jpg",
   "image/png": "png",
   "image/webp": "webp",
 };

// Nous créons une constante storage,
// qui contient la logique nécessaire pour indiquer à multer où et comment enregistrer les fichiers entrants :
const storage = multer.diskStorage({
  // La fonction destination indique à multer d'enregistrer les fichiers dans le dossier images :
  destination: (req, file, callback) => {
    // Le 1er argument du callback est null pour dire qu'il n'y a pas eu d'erreur à ce niveau là,
    // Le 2ème argument est le nom du dossier :
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // On enlève le .extension du nom d'origine (pour ne pas avoir nom.jpg012345678.jpg).
    // On remplace les espaces par des underscores 
    // (car certains noms de fichiers ont des espaces, ce qui peut poser des problèmes côté serveur) :  
    let name = file.originalname.split(".")[0];
    name = name.split(" ").join("_");
    // On utilise ensuite la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée :
    const extension = MIME_TYPES[file.mimetype];
    // On appelle le callback, avec le nom créé au dessus
    // + un timestamp Date.now() pour le rendre le plus unique possible
    // + un point
    // + l'extension du fichier.
    // (Le timestamp est le nombre de secondes écoulées depuis le 1er janvier 1970 /
    // L’heure UTC (Universal Time Coordinated) est l’heure de référence internationale.
    // Elle correspond aussi à l’heure GMT (Greenwich Mean Time) et à l’heure Z (Zulu)) :
    callback(null, name + Date.now() + "." + extension);
  },
});

// Nous exportons ensuite l'élément multer entièrement configuré et lui passons notre constante storage.
// Avec .single, on lui indique qu'il s'agit d'un fichier unique, et non pas d'un groupe de fichiers.
// Nous lui indiquons que nous gérerons uniquement le téléchargement de fichier "image" :
module.exports = multer({ storage: storage }).single("image");
