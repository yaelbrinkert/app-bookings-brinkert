const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => console.log("Erreur de connexion à Redis", err));
client.on("connect", () => console.log("Connecté à Redis"));

client.connect(); // Connexion à Redis (nécessaire pour Redis 4.x)

module.exports = client;
