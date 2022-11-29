// Pour pouvoir créer un serveur, on importe le package http natif de Node :
const http = require("http");

// On importe l'application express (que l'on a exportée depuis app.js) :
const app = require("./app");

// On crée un serveur avec la méthode createServer du package http.
// Cette methode prend en argument l'application express qui sera appelée à chaque requête reçue par le serveur :
const server = http.createServer(app);

// La fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne :
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// On déclare le port (dont le numéro est indiqué dans le fichier .env) :
const port = normalizePort(`${process.env.PORT}`);

// La fonction errorHandler recherche les différentes erreurs et les gère de manière appropriée :
const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// On dit à notre application express sur quel port elle doit tourner :
app.set("port", port);

// La fonction errorHandler est enregistrée dans le serveur :
server.on("error", errorHandler);

// Un écouteur d'évènements est également enregistré,
// consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console :
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// Le serveur écoute les requêtes envoyées sur le port choisi :
server.listen(port);
