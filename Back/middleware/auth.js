const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, "TOKEN_USER");
    req.userId = decoded.userId;
    pool.query(
      "SELECT * FROM admin WHERE id = ?",
      [req.userId],
      (error, results) => {
        if (error) {
          return res
            .status(500)
            .json({ success: false, message: "Erreur du serveur" });
        }

        if (results.length > 0) {
          req.user = results[0];
          next();
        } else {
          res
            .status(404)
            .json({ success: false, message: "Utilisateur non trouvé" });
        }
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
