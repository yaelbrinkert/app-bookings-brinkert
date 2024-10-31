require("dotenv").config({ path: "../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./config/database");
const redisClient = require("./controller/redisClient.js");
const nodemailer = require("nodemailer");

const controllersAdmin = require("./controller/controllerAdmin.js");
const verifyToken = require("./middleware/auth.js");
const verifyCode = require("./middleware/verifycode.js");

const app = express();
const port = process.env.PORT || 1234;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Utilisation du middleware CORS
app.use(cors());

app.get("/", (req, res) => res.send("Express running"));

// Route pour récupérer les données
app.get("/bookings", (req, res) => {
  pool.query("SELECT * FROM bookings", (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des données:", err);
      return res.status(500).send("Erreur serveur");
    }
    // console.log("Les données de la table bookings : \n", rows);
    res.json(rows);
  });
});

app.get(`/bookings/:date`, (req, res) => {
  const date = req.params.date;
  pool.query("SELECT * FROM bookings WHERE date = ?", [date], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des données:", err);
      return res.status(500).send("Erreur serveur");
    }
    res.json(rows);
  });
});

app.get(`/bookings/single/:id`, (req, res) => {
  const idBooking = req.params.id;
  pool.query(
    "SELECT * FROM bookings WHERE id = ?",
    [idBooking],
    (err, rows) => {
      if (err) {
        console.error("Erreur lors de la récupération des données:", err);
        return res.status(500).send("Erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.put(`/bookings/:id`, verifyToken, (req, res) => {
  const idBooking = req.params.id;
  const date = req.body.dateToModify;
  const firstPartTime = req.body.timeToModify;
  // const time = `${firstPartTime}:00`;
  pool.query(
    "UPDATE bookings SET date = ?, hour = ? WHERE id = ?",
    [date, firstPartTime, idBooking],
    (err, rows) => {
      if (err) {
        console.error("Erreur lors de l'envoie des données:", err);
        return res.status(500).send("Erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.get("/opening/dayopen", (req, res) => {
  pool.query("SELECT * FROM opening_hours", (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des données:", err);
      return res.status(500).send("Erreur serveur");
    }
    res.json(rows);
  });
});

app.get("/opening/dayopen/:day", (req, res) => {
  const day = req.params.day;
  pool.query(
    "SELECT * FROM opening_hours WHERE day_of_week = ?",
    [day],
    (err, rows) => {
      if (err) {
        console.error("Erreur lors de la récupération des données:", err);
        return res.status(500).send("Erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.get("/professional/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM slot_longevity WHERE id_professional = ? LIMIT 1",
    [id],
    (err, rows) => {
      if (err) {
        console.log("Erreur lors de la récupération des données: ", err);
        return res.status(500).send("Erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.post("/slotlongevity/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const numberLongevity = req.body.slot_longevity;
  pool.query(
    "UPDATE slot_longevity SET `slot_longevity` = ? WHERE id_professional = ?",
    [numberLongevity, id],
    (err, rows) => {
      if (err) {
        console.log("Erreur lors de la mise à jour des données", err);
        return res.status(500).send("erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.get("/timings/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM opening_hours WHERE id_professional = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.log("Erreur lors de la récupération des données", err);
        return res.status(500).send("Erreur serveur");
      }
      res.json(rows);
    }
  );
});

app.get("/opening/daysoff/", (req, res) => {
  pool.query("SELECT * FROM off_days", (err, rows) => {
    if (err) {
      console.log("Erreur lors de la récupération des jours off:", err);
      return res.status(500).send("Erreur serveur");
    }
    res.json(rows);
  });
});

app.get("/bookings/weekly/:datestart", (req, res) => {
  const dateToStart = req.params.datestart;
  const startDayOfWeek = new Date(dateToStart);
  const dayOfWeek = startDayOfWeek.getDay();
  const difference =
    startDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startDayOfWeek.setDate(difference);
  const endDayOfWeek = new Date(startDayOfWeek);
  endDayOfWeek.setDate(startDayOfWeek.getDate() + 6);

  function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mois de 1 à 12
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Format YYYY-MM-DD
  }
  const day1 = formatDate(startDayOfWeek);
  const day2 = formatDate(endDayOfWeek);
  pool.query(
    "SELECT * FROM bookings WHERE date >= ? AND date <= ? ORDER BY hour ASC",
    [day1, day2],
    (err, rows) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération des bookings par semaines",
          err
        );
      }
      res.json(rows);
    }
  );
});

// app.post("/verifcation", async (req, res) => {
//   const nameForm = req.body.name;
//   const hourForm = req.body.hour;
//   const dateForm = req.body.date;
//   const emailForm = req.body.email;

//   const idRedis = `${nameForm}${emailForm}`;

//   const code6numbers = await create6numberscode();
//   storeConfirmationCode(idRedis, code6numbers);
// });

app.post("/awaitingconfirmation", verifyCode, async (req, res) => {
  const redisCode = req.otp;
  const { name, hour, date, email } = req.body;
  res.json({ success: true, message: "Code de confirmation envoyé" });
});

app.post("/bookingconfirmed", async (req, res) => {
  const nameForm = req.body.name;
  const hourForm = req.body.hour;
  const dateForm = req.body.date;
  const emailForm = req.body.email;
  const code = req.body.code;

  try {
    const storedCode = await redisClient.get(emailForm);

    if (storedCode === code) {
      const sqlInsert = `INSERT INTO bookings (date, email, name, hour) VALUES (?, ?, ?, ?)`;

      pool.query(
        sqlInsert,
        [dateForm, emailForm, nameForm, hourForm],
        (err, rows) => {
          if (err) {
            console.error("Erreur lors de l'envoi des données:", err);
            return res.status(500).send("Erreur serveur");
          }
          res.json(rows);
          // send mail of confirmation
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADRESS,
              pass: process.env.PASSWORD_GMAIL,
            },
          });
          const mailOptions = {
            from: process.env.EMAIL_ADRESS,
            to: emailForm,
            subject: `Votre réservation pour le ${dateForm} a bien été confirmée. Merci pour votre confiance.`,
            html: `
                  <h1>Bonjour ${nameForm},</h1><br><br>
                  <p>Votre réservation pour la date du ${dateForm} a bien été confirmée, pour ${hourForm}. Si vous souhaitez annuler, ou modifier votre créneau, pensez à appeler votre kinésithérapeute au moins <b>24 heures avant votre rendez-vous</b> au numéro suivant : 01 23 45 67 89.</p><br><br>
                  <p>A bientôt, votre kiné préférée.</p>
                  <br><br>
                  <p>Lorem ipsum pour faire un petit peu de contenu et que ce ne soit pas un spam...</p>
                `,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      );
    } else {
      console.log("Erreur lors de la confirmation du code");
      return res.status(401).send("Non autorisé pour code invalide.");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du code de confirmation.");
    return res.status(500).send("Erreur serveur");
  }

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL_ADRESS,
  //     pass: process.env.PASSWORD_GMAIL,
  //   },
  // });
  // const mailOptions = {
  //   from: process.env.EMAIL_ADRESS,
  //   to: process.env.EMAIL_ADRESS,
  //   replyTo: emailForm,
  //   subject: `Votre réservation pour le ${dateForm} a bien été confirmée. Merci pour votre confiance.`,
  //   html: `
  //       <h1>Bonjour ${nameForm},</h1><br><br>
  //       <p>Votre réservation pour la date du ${dateForm} a bien été confirmée, pour ${hourForm}. Si vous souhaitez annuler, ou modifier votre créneau, pensez à appeler votre kinésithérapeute au moins <b>24 heures avant votre rendez-vous</b> au numéro suivant : 01 23 45 67 89.</p><br><br>
  //       <p>A bientôt, votre kiné préférée.</p>
  //     `,
  // };
  // // transporter.sendMail(mailOptions, function (error, info) {
  // //   if (error) {
  // //     console.log(error);
  // //   } else {
  // //     console.log("Email sent: " + info.response);
  // //   }
  // // });
});

app.post("/login", controllersAdmin.login);
app.get("/verifyToken", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id_professional,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

app.listen(port, () => console.log(`Serveur en écoute sur le port ${port}`));

module.exports = app;
