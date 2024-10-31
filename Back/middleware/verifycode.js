// async function storeConfirmationCode(userId, code) {
//   const key = `${userId}`;
//   const expirationTime = 10 * 60; // 10 minutes en secondes

//   await redisClient.set("key", key);
//   await redisClient.expire("key", expirationTime);
//   await redisClient.set("code", code);
//   const value = await redisClient.get("key");
//   const valueCode = await redisClient.get("code");
//   console.log(value, valueCode);
// }
const redisClient = require("../controller/redisClient");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

async function storeConfirmationCode(req, res, next) {
  try {
    const {
      name: nameForm,
      hour: hourForm,
      date: dateForm,
      email: emailForm,
    } = req.body;
    // Générer un code OTP de 6 chiffres
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Stocker le code OTP dans Redis avec une expiration de 10 minutes (600 secondes)
    await redisClient.setEx(emailForm, 600, otp);

    // Optionnel : ajouter le code OTP à la requête si besoin dans la prochaine étape
    req.otp = otp;

    // Send mail with code
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
      subject: `Votre réservation pour le ${dateForm} doit être confirmée.`,
      html: `
            <h1>Bonjour ${nameForm},</h1><br><br>
            <p>Votre réservation pour la date du ${dateForm} doit être confirmée, pour ${hourForm}. Après avoir confirmé votre rendez-vous, si vous souhaitez l'annuler, ou le modifier, pensez à appeler votre kinésithérapeute au moins <b>24 heures avant votre rendez-vous</b> au numéro suivant : 01 23 45 67 89.</p><br><br>
            <p>Votre code de confirmation : ${otp}</p>
            <br><br>
            <p>A bientôt, votre kiné préférée.</p>
          `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    next();
  } catch (error) {
    console.error("Erreur lors du stockage du code OTP dans Redis :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la génération du code de confirmation",
    });
  }
}

module.exports = storeConfirmationCode;
