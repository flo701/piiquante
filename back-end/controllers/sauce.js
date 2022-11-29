// Ici nous avons la logique métier appliquée à chaque route.
// Un fichier de contrôleurs exporte des méthodes qui sont ensuite attribuées aux routes
// pour améliorer la maintenabilité de notre application.

// On importe le modèle Sauce :
const Sauce = require("../models/Sauce");

// On importe le package fs (file system) de Node.
// Il nous donne accès aux fonctions qui nous permettent de modifier le système de fichiers,
// y compris aux fonctions permettant de supprimer les fichiers :
const fs = require("fs");

// ---------------------------------------------------------------------------------------------------------------
// Récupérer toutes les sauces de notre base de données :
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    // Si les sauces sont trouvées, on renvoie en réponse le code 200 (OK)
    // et le tableau des sauces, reçu depuis la base de données, en format json :
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    // Sinon, on envoie une erreur 500 au front-end, avec l'erreur générée :
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// ---------------------------------------------------------------------------------------------------------------
// Récupérer une sauce :
exports.getOneSauce = (req, res, next) => {
  // On utilise la méthode findOne() dans notre modèle Sauce,
  // pour trouver la sauce unique ayant le même _id que le paramètre de la requête :
  Sauce.findOne({
    _id: req.params.id,
  })
    // Cette sauce est ensuite retournée dans une Promise et envoyée au front-end.
    // On renvoie le code 200 (OK) et la sauce en format json :
       .then((sauce) => {
      res.status(200).json(sauce);
    })
    // Sinon, on renvoie une erreur 404 (Not Found) au front-end, avec l'erreur générée :
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// --------------------------------------------------------------------------------------------------------------
// Créer une sauce et l'enregistrer dans la base de données :
exports.createSauce = (req, res, next) => {
  // Pour ajouter un fichier à la requête,
  // le front-end doit envoyer les données de la requête sous la forme form-data et non sous forme JSON.
  // Le corps de la requête contient une chaîne sauce, qui est simplement un objetSauce converti en chaîne.
  // Nous devons donc l'analyser à l'aide de JSON.parse() pour obtenir un objet utilisable :
  const sauceObject = JSON.parse(req.body.sauce);
  // Nous supprimons l'id de l'objet, car il va être généré automatiquement par notre base de données :
  delete sauceObject._id;
  // Nous supprimons le champ userId de la requête envoyée par le client
  // car nous ne devons pas lui faire confiance
  // (rien ne l’empêcherait de nous passer le userId d’une autre personne) :
  delete sauceObject.userId;
  // On crée une instance de notre modèle Sauce
  // en lui passant un objet JavaScript contenant toutes les informations requises du corps de requête analysé.
  // L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body : 
  // (au lieu de faire : const sauce = new Sauce({
  //                            name: req.body.title,
  //                            manufacturer: req.body.manufacturer, etc... }); )
  const sauce = new Sauce({
    ...sauceObject,
    // Nous remplaçons le champ userId de la requête
    // par le userId extrait du token par le middleware d’authentification :
    userId: req.auth.userId,
    // Nous devons également résoudre l'URL complète de notre image,
    // car req.file.filename ne contient que le segment filename.
    // Nous utilisons req.protocol pour obtenir le premier segment (dans notre cas 'http').
    // Nous ajoutons '://', puis utilisons req.get('host') pour résoudre l'hôte du serveur (ici, 'localhost:3000').
    // Nous ajoutons finalement '/images/' et le nom de fichier pour compléter notre URL :
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    // On initialise les likes et dislikes, ainsi que les tableaux usersLiked et usersDisliked :
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  // On enregistre la sauce dans la base de données.
  // La méthode save() renvoie une Promise. Ainsi, dans notre bloc then(),
  // nous renverrons une réponse de réussite avec un code 201 (Created) et un message "Sauce créée et enregistrée".
  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce created and registered !" });
    })
    .catch((error) => {
      // En cas d'erreur, on renvoie le code 400 (Bad Request), et le message d'erreur généré par Mongoose :
      res.status(400).json({ error });
    });
};

// ----------------------------------------------------------------------------------------------------------------
// Modifier une sauce :
exports.modifySauce = (req, res, next) => { 
  // On recherche la sauce en question dans la base de données :
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si le requérant n'est pas le propriétaire de l’objet 
      // (si le userId de la base de données est différent du userId que nous renvoie le token),
      // on renvoie un code 403 (Forbidden) :
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Request forbidden" });
      } else {
        // Sinon le requérant est bien le propriétaire.
        // S'il y a un fichier dans la requête :
        if (req.file) {
          // Si req.file existe, donc si un fichier est dans la requête,
          // on récupère l'objet en parsant la chaîne de caractères et en recréant l'Url de notre image :
          const sauceObject = 
            {...JSON.parse(req.body.sauce),
            imageUrl : `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`}
          // On supprime le champ userId envoyé par le client (afin d’éviter de changer son propriétaire) :
          delete sauceObject.userId;
          // On supprime l'ancienne image de la base de données.
          // Nous utilisons le fait de savoir que notre URL d'image contient un segment /images/
          // pour séparer le nom de fichier.
          // Nous utilisons ensuite la fonction unlink du package fs pour supprimer ce fichier,
          // en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé :
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`,() => {
          // Nous exploitons la méthode updateOne() dans notre modèle Sauce.
          // Cela nous permet de mettre à jour la Sauce
          // qui correspond à l'objet que nous passons comme premier argument.
          // On utilise le paramètre id passé dans la demande,
          // et on le remplace par la Sauce passée comme second argument :
            Sauce.updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
              // En cas de réussite, on renvoie le code 201 (Created) et le message "Sauce modifiée" :
              .then(() => res.status(201).json({ message: "Sauce modified" }))
              .catch((error) => {
                // En cas d'erreur, on renvoie un code 400 (Bad Request) :
                res.status(400).json({ error });
              });
          })
        } else {
          // Si req.file n'existe pas, on récupère simplement l'objet dans le corps de la requête,
          // et on met à jour la sauce :
          const sauceObject = {...req.body };
          delete sauceObject.userId;
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(201).json({ message: "Sauce modified" }))
            .catch((error) => {
              res.status(400).json({ error });
            })
        }
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    })      
}

// ----------------------------------------------------------------------------------------------------------------
// Supprimer une sauce :
exports.deleteSauce = (req, res, next) => {
  // Nous utilisons l'ID que nous recevons comme paramètre
  // pour accéder à la sauce correspondante dans la base de données :
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si le requérant n'est pas le propriétaire de l’objet,
      // on renvoie un code 403 (Forbidden) :
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Request forbidden" });
      } else {
        // Sinon, on supprime l'objet de la base de données, mais aussi l'image :
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // La méthode deleteOne() de notre modèle fonctionne comme findOne() et updateOne()
          // dans le sens où nous lui passons un objet correspondant au document à supprimer :
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce deleted" });
            })
            .catch((error) => {
              res.status(400).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// -----------------------------------------------------------------------------------------------------------------
// Liker ou disliker une sauce :
exports.likeSauce = (req, res, next) => {
  let userId = req.body.userId;
  let like = req.body.like;
  let sauceId = req.params.id;

  // La requête sera envoyée par le front-end avec 2 paramètres dans le body ; 
  // le userId et le "like", ou "dislike", ou le retrait d'un "like" ou "dislike" (1 ou -1 ou 0) :
  console.log("Corps de la requête : " + JSON.stringify(req.body));
  
  if (like === 1) {
    // Si l'utilisateur "like" la sauce :
    Sauce.updateOne(
      { _id: sauceId },
      {
        // On incrémente les likes de la sauce :
        $inc: { likes: 1 },
        // Et on "pousse" le userId dans le tableau usersLiked de la sauce :
        $push: { usersLiked: userId },
      }
    )
      // En cas de réussite, on renvoie un code 201 (Created) et un message "Sauce appréciée".
      // En cas d'échec, on renvoie un code 500 (Internal Server Error) avec le message d'erreur :
      .then(() => res.status(201).json({ message: "Sauce appreciated" }))
      .catch((error) => {
        res.status(500).json({ error });
      });
  } else if (like === -1) {
    // Si l'utilisateur "dislike" la sauce :
    Sauce.updateOne(
      { _id: sauceId },
      {
        // On incrémente les dislikes de la sauce :
        $inc: { dislikes: 1 },
        // Et on "pousse" le userId dans le tableau usersDisliked de la sauce :
        $push: { usersDisliked: userId },
      }
    )
      .then(() => res.status(201).json({ message: "Sauce not appreciated" }))
      .catch((error) => {
        res.status(500).json({ error });
      });
  } else {
    // Si like === 0,
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          // Si l'utilisateur souhaite annuler son "like",
          // on retire son userId du tableau usersLiked, et on décrémente les "likes" de la sauce :
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => {
              res.status(201).json({ message: "Like removed" });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        } else if (sauce.usersDisliked.includes(userId)) {
          // Si l'utilisateur souhaite annuler son "dislike",
          // on retire son userId du tableau usersDisliked, et on décrémente les "dislikes" de la sauce :
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => {
              res.status(201).json({ message: "Dislike removed" });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        }
      })
      .catch((error) => {
        res.status(404).json({ error });
      });
  }
};
