const Bcrypt = require("bcrypt");
// const User = require("./models/user");
const jsonwebtoken = require("jsonwebtoken");
const pool = require("../config/database");

// no need for signup yet since we give this account only to the manager
exports.signup = (req, res) => {
  Bcrypt.hash(req.body.password, 12)
    .then((hash) => {
      console.log(hash);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  pool.query(
    "SELECT * FROM admin WHERE email = ?",
    [req.body.email],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ err });
      }

      if (rows.length === 0) {
        return res.status(401).json({ message: "Nom d'utilisateur incorrect" });
      }

      const user = rows[0];
      // Comparer le mot de passe envoyé avec celui de la base de données
      Bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
          if (valid) {
            const jwt_data = jsonwebtoken.sign(
              { userId: user.id },
              "TOKEN_USER",
              {
                expiresIn: "24h",
              }
            );
            return res.json({ token: jwt_data, id: user.id });
          } else {
            return res.status(401).json({ message: "Mot de passe incorrect" });
          }
        })
        .catch((error) => res.status(500).json({ error }));
    }
  );
};
