// Init de nodemailer pour l'envoie de confirmation de RDV

// async function storeConfirmationCode(userId, code) {
//   const key = `confirmationCode:${userId}`;
//   const expirationTime = 10 * 60; // 10 minutes en secondes

//   await redisClient.setEx(key, expirationTime, code);
// }

// Initialisation des années, mois et de la date
let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let currDay = date.getDay();
let currTime = date.getTime();

// Wrappers et containers
const wrapperDays = document.querySelector(".calendar-dates");
const currentMonthAndDate = document.querySelector(".current-month-year");
let prenexIcons = document.querySelectorAll(".calendar-navigation span");
const urlBackendHours = "http://localhost:1234";
const containerCalendrierHours = document.querySelector(".hours-container");
const wrapperCalendrierJours = document.querySelector(".calendar-container");
containerCalendrierHours.innerHTML = "";

// Tableau des mois
const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Fonction pour formater la date en YYYY-MM-DD sans le décalage de fuseau horaire
function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mois de 1 à 12
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`; // Format YYYY-MM-DD
}

// Fonction pour générer le calendrier
const generateCalendar = async () => {
  let firstDayOfTheMonth = new Date(year, month, 1).getDay();
  let lastDateOfTheMonth = new Date(year, month + 1, 0).getDate();
  let lastDayOfTheMonth = new Date(year, month, lastDateOfTheMonth).getDay();
  let lastDateOfPreviousMonth = new Date(year, month, 0).getDate();

  let calendar = "";

  async function fetchOpenDays() {
    try {
      const res = await fetch(urlBackendHours + "/opening/dayopen", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      return await res.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des jours ouverts:", error);
      return null; // En cas d'erreur, retourner null ou une valeur par défaut
    }
  }

  async function fetchDaysOff() {
    try {
      const res = await fetch(urlBackendHours + "/opening/daysoff/", {
        method: "GET",
        header: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des jours off");
      }
      return await res.json();
    } catch (err) {
      console.error("Erreur", err);
      return null;
    }
  }

  // Jours du mois précédent (inactifs)
  for (let i = firstDayOfTheMonth; i > 0; i--) {
    let prevMonthDate = new Date(
      year,
      month - 1,
      lastDateOfPreviousMonth - i + 1
    );
    let formattedPrevMonthDate = formatDate(prevMonthDate); // Utiliser formatDate
    calendar += `<li class="inactive" data-date="${formattedPrevMonthDate}" data-clickable="not-clickable">${
      lastDateOfPreviousMonth - i + 1
    }</li>`;
  }

  // Jours du mois courant
  for (let i = 1; i <= lastDateOfTheMonth; i++) {
    let currentDateForFormat = new Date(year, month, i);
    let formattedCurrentDate = formatDate(currentDateForFormat);
    let dayOfWeek = currentDateForFormat.getDay();

    let currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const dataOpenDays = await fetchOpenDays();

    let isDisabled = "";
    let isToday = "";
    let isDisabledClass = "";
    let isClickable = "is-clickable";

    const isOpen = dataOpenDays.find((day) => day.day_of_week === dayOfWeek);
    // Si le jour est fermé, on désactive l'option
    if (isOpen && isOpen.is_open === 0) {
      isDisabled = "disabled";
      isDisabledClass = "btn_day_not_opened";
      isClickable = "not-clickable";
    }

    const dataDaysOff = await fetchDaysOff();
    const isDayOff = dataDaysOff.find((dayOff) => {
      const dbDateFormatted = formatDate(new Date(dayOff.date));
      return dbDateFormatted === formattedCurrentDate;
    });

    if (isDayOff) {
      isDisabled = "disabled";
      isDisabledClass = "btn_day_not_opened";
      isClickable = "not-clickable";
    }

    // On regarde si le jour d'aujourd'hui est actif
    if (
      year < currentYear ||
      (year === currentYear && month < currentMonth) ||
      (year === currentYear && month === currentMonth && i < currentDay)
    ) {
      // Si la date est dans le passé
      isToday = "inactive";
      isClickable = "not-clickable";
    } else if (
      i === currentDay &&
      month === currentMonth &&
      year === currentYear
    ) {
      // Si c'est la date actuelle
      isToday = "active";
    } else {
      isToday = "";
    }
    // Construction de l'élément de calendrier
    calendar += `<li class="${isToday} ${isDisabledClass}" data-date="${formattedCurrentDate}" data-clickable="${isClickable}" ${isDisabled}>${i}</li>`;
  }

  // Mise à jour du mois et de la date sélectionnée
  currentMonthAndDate.innerText = `${months[month]} ${year}`;
  wrapperDays.innerHTML = calendar;

  // Réattacher les événements de clic après avoir généré le calendrier
  attachClickEventToDays();
};

// Fonction pour attacher l'événement click sur chaque jour
const attachClickEventToDays = () => {
  let daysCalendar = document.querySelectorAll(".calendar-dates li");
  daysCalendar.forEach((day) => {
    day.addEventListener("click", (event) => {
      let selectedDayIsOpen = event.target.getAttribute("data-clickable");
      if (selectedDayIsOpen === "not-clickable") {
        console.log("not avalaible");
      } else {
        let selectedDate = event.target.getAttribute("data-date");
        //console.log("Date sélectionnée:", selectedDate);
        generateHoursOfWeek(selectedDate);
      }
    });
  });
};

// Fonction pour gérer l'affichage d'heures (ou autre contenu lié à la date sélectionnée)
function generateHoursOfWeek(date) {
  containerCalendrierHours.classList.toggle("activate-hours");
  wrapperCalendrierJours.classList.toggle("activate-days");

  containerCalendrierHours.innerHTML = "";

  const splitDate = date.split("-");
  const dateFormatSlash = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
  containerCalendrierHours.innerHTML += `${dateFormatSlash}`;
  getSpecificHours(date);
}

// Initialiser le calendrier
generateCalendar();

// Navigation entre les mois
prenexIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    // Vérifier si l'icône est "calendar-prev" ou "calendar-next"
    month = icon.id === "calendar-prev" ? month - 1 : month + 1;

    // Vérifier si le mois est hors des limites (moins de 0 ou plus de 11)
    if (month < 0 || month > 11) {
      // Réinitialiser la date avec le nouveau mois et l'année correspondante
      date = new Date(year, month, new Date().getDate());

      // Mettre à jour l'année et le mois
      year = date.getFullYear();
      month = date.getMonth();
    } else {
      // Réinitialiser à la date courante
      date = new Date();
    }

    // Regénérer le calendrier et réattacher les événements de clic
    generateCalendar();
  });
});

function getSpecificHours(date) {
  const dateFF = new Date(date);
  const day = dateFF.getDay();

  fetch(urlBackendHours + "/bookings/" + date, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      return res.json();
    })
    .then((datas) => {
      fetch(urlBackendHours + "/opening/dayopen/" + day, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Erreur lors de la récupération des données");
          }
          return res.json();
        })
        .then((ohdatas) => {
          const id = 1;
          fetch(urlBackendHours + "/professional/" + id, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Erreur lors de la récupération des données");
              }
              return res.json();
            })
            .then((professionalDatas) => {
              const dataSlotLongevity = professionalDatas.find(
                ({ id_professional }) => id_professional === id
              );
              let slotLongevity = dataSlotLongevity.slot_longevity;

              containerCalendrierHours.innerHTML = "";

              const backToDaysBtn = document.createElement("span");
              backToDaysBtn.classList.add("backToDays");
              backToDaysBtn.innerHTML = "<i class='fa fa-arrow-left'></i>";
              containerCalendrierHours.appendChild(backToDaysBtn);

              const splitDate = date.split("-");
              const dateToShow = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;

              const titleHoursModalWithDate = document.createElement("p");
              titleHoursModalWithDate.className = "dateModalHours";
              titleHoursModalWithDate.innerText = `${dateToShow}`;
              containerCalendrierHours.appendChild(titleHoursModalWithDate);

              const hoursWrapper = document.createElement("div");
              hoursWrapper.classList.add("hours-wrapper");
              containerCalendrierHours.appendChild(hoursWrapper);

              backToDaysBtn.addEventListener("click", function () {
                containerCalendrierHours.classList.toggle("activate-hours");
                wrapperCalendrierJours.classList.toggle("activate-days");
              });

              let startHourAM = new Date(date);
              let endHourAM = new Date(date);
              let startHourPM = new Date(date);
              let endHourPM = new Date(date);
              const dataHours = ohdatas.find(
                ({ day_of_week }) => day_of_week === day
              );
              //console.log(dataHours.start_time_morning);

              const today = new Date();
              let hourRightNow = today.getHours().toString().padStart(2, "0");
              let minutesRightNow = today
                .getMinutes()
                .toString()
                .padStart(2, "0");
              let secondsRightNow = "00";
              let formattedTimeRightNow = `${hourRightNow}:${minutesRightNow}:${secondsRightNow}`;
              const formatedToday = formatDate(today);

              if (dataHours.start_time_morning === "00:00:00") {
                // hoursWrapper.innerHTML += "Aucun créneau ce matin.";
                console.log("Aucun créneau le matin");
              } else {
                let startTimeMorning = dataHours.start_time_morning.split(":"); // Divise "09:00:00" en ["09", "00", "00"]
                startHourAM.setHours(parseInt(startTimeMorning[0])); // Heures
                startHourAM.setMinutes(parseInt(startTimeMorning[1])); // Minutes
                startHourAM.setSeconds(parseInt(startTimeMorning[2])); // Secondes

                let endTimeMorning = dataHours.end_time_morning.split(":");
                endHourAM.setHours(parseInt(endTimeMorning[0]));
                endHourAM.setMinutes(parseInt(endTimeMorning[1]));
                endHourAM.setSeconds(parseInt(endTimeMorning[2]));

                while (startHourAM <= endHourAM) {
                  let hours = startHourAM
                    .getHours()
                    .toString()
                    .padStart(2, "0");
                  let minutes = startHourAM
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                  let seconds = "00"; // On garde les secondes à 00

                  // Format HH:mm:ss
                  let formattedTime = `${hours}:${minutes}:${seconds}`;
                  let formattedTimeToShow = `${hours}:${minutes}`;

                  let classHour = "btn_enabled";
                  let isItDisabled = "";
                  datas.forEach((data) => {
                    if (data.hour === formattedTime) {
                      classHour = "btn_disabled";
                      isItDisabled = "disabled";
                    }
                  });

                  if (
                    date === formatedToday &&
                    formattedTime < formattedTimeRightNow
                  ) {
                    classHour = "btn_disabled";
                    isItDisabled = "disabled";
                  }
                  hoursWrapper.innerHTML += `<button class="btn_reservation ${classHour}" 
          data-date="${date}" 
          data-hour="${formattedTime}"
          data-formatted="${formattedTime}"
          data-formatted-to-show="${formattedTimeToShow}" ${isItDisabled}>
          ${formattedTimeToShow}
        </button>`;

                  // Incrémente l'heure de 15/30/45 minutes...
                  startHourAM.setMinutes(
                    startHourAM.getMinutes() + slotLongevity
                  );
                }
                document
                  .querySelectorAll(".btn_reservation")
                  .forEach((button) => {
                    button.addEventListener("click", function () {
                      const selectedDate = this.getAttribute("data-date");
                      const selectedHour = this.getAttribute("data-hour");
                      const formattedTime = this.getAttribute("data-formatted");
                      const formattedTimeToshow = this.getAttribute(
                        "data-formatted-to-show"
                      );

                      // Ouvrir la modal et afficher les informations
                      openModal(
                        selectedDate,
                        selectedHour,
                        formattedTime,
                        formattedTimeToshow
                      );
                    });
                  });
              }

              // MIDDLE BAR TO SEPARATE AFTERNOON AND MORNING

              // AFTERNOON STARTING HERE ->

              if (dataHours.start_time_afternoon === "00:00:00") {
                // hoursWrapper.innerHTML += "Aucun créneau cet après-midi.";
                console.log("Aucun créneau l'après midi");
              } else {
                let startTimeAfternoon =
                  dataHours.start_time_afternoon.split(":"); // Divise "09:00:00" en ["09", "00", "00"]
                startHourPM.setHours(parseInt(startTimeAfternoon[0])); // Heures
                startHourPM.setMinutes(parseInt(startTimeAfternoon[1])); // Minutes
                startHourPM.setSeconds(parseInt(startTimeAfternoon[2])); // Secondes

                let endTimeAfternoon = dataHours.end_time_afternoon.split(":");
                endHourPM.setHours(parseInt(endTimeAfternoon[0]));
                endHourPM.setMinutes(parseInt(endTimeAfternoon[1]));
                endHourPM.setSeconds(parseInt(endTimeAfternoon[2]));

                while (startHourPM <= endHourPM) {
                  let hours = startHourPM
                    .getHours()
                    .toString()
                    .padStart(2, "0");
                  let minutes = startHourPM
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                  let seconds = "00"; // On garde les secondes à 00

                  // Format HH:mm:ss
                  let formattedTime = `${hours}:${minutes}:${seconds}`;
                  let formattedTimeToShow = `${hours}:${minutes}`;

                  let classHour = "btn_enabled";
                  let isItDisabled = "";
                  datas.forEach((data) => {
                    if (data.hour === formattedTime) {
                      classHour = "btn_disabled";
                      isItDisabled = "disabled";
                    }
                  });
                  if (
                    date === formatedToday &&
                    formattedTime < formattedTimeRightNow
                  ) {
                    classHour = "btn_disabled";
                    isItDisabled = "disabled";
                  }
                  hoursWrapper.innerHTML += `<button class="btn_reservation ${classHour}" 
          data-date="${date}" 
          data-hour="${formattedTime}"
          data-formatted="${formattedTime}"
          data-formatted-to-show="${formattedTimeToShow}" ${isItDisabled}>
          ${formattedTimeToShow}
        </button>`;

                  // Incrémente l'heure de 30 minutes
                  startHourPM.setMinutes(
                    startHourPM.getMinutes() + slotLongevity
                  );
                }
                document
                  .querySelectorAll(".btn_reservation")
                  .forEach((button) => {
                    button.addEventListener("click", function () {
                      const selectedDate = this.getAttribute("data-date");
                      const selectedHour = this.getAttribute("data-hour");
                      const formattedTime = this.getAttribute("data-formatted");
                      const formattedTimeToshow = this.getAttribute(
                        "data-formatted-to-show"
                      );

                      // Ouvrir la modal et afficher les informations
                      openModal(
                        selectedDate,
                        selectedHour,
                        formattedTime,
                        formattedTimeToshow
                      );
                    });
                  });
              }
            });
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function openModal(date, hour, formattedTime, formattedTimeToShow) {
  // Ici, vous pouvez ajouter du code pour manipuler la modal, afficher les informations
  const modal = document.querySelector(".modal-reservation"); // Supposons que vous ayez une div .modal pour la modal
  modal.style.display = "block"; // Afficher la modal

  const splitDate = date.split("-");
  const dateFormatSlash = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;

  // Ajouter les informations dans la modal
  modal.querySelector(".modal-body-reservation").innerHTML = `
    <p>Réservation pour le ${dateFormatSlash} à ${formattedTimeToShow}</p><br>
    <form method="POST" class="form_reservation">
      <input type="hidden" name="hour" value="${formattedTime}">
      <input type="hidden" name="date" value="${date}">
      <div>
        <label for="name">Votre nom :</label>
        <input type="text" name="name" id="name" required>
      </div>
      <div>
        <label for="email">Votre email :</label>
        <input type="email" name="email" id="email" required>
      </div>
      <button type="submit" id="sendIntoCalendar">Confirmer la réservation</button>
    </form>
    <p>Cliquez sur confirmer pour finaliser la réservation.</p>
  `;

  const form = modal.querySelector(".form_reservation");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch(urlBackendHours + "/awaitingconfirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la réservation");
        }
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          // alert("Réservation confirmée");
          console.log("confirmation réservation");
          modal.querySelector(".modal-body-reservation").innerHTML = `
          <form method="POST" class="form_confirmation">   
            <label>Insérez le code reçu à votre adresse email :</label>            
            <input
            type="text"
            autocomplete="one-time-code"
            inputmode="numeric"
            maxlength="6"
            name="code"
            id="codeinput"
            >
            <button type="submit">Confirmer</button>
          </form>
        `;
          const form_confirmation =
            document.querySelector(".form_confirmation");
          form_confirmation.addEventListener("submit", function (event) {
            event.preventDefault();
            const formDataConfirm = new FormData(form_confirmation);
            const dataCode = Object.fromEntries(formDataConfirm.entries());

            dataCode.name = data.name;
            dataCode.hour = data.hour;
            dataCode.date = data.date;
            dataCode.email = data.email;

            fetch(urlBackendHours + "/bookingconfirmed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataCode),
            })
              .then((res) => {
                if (!res.ok) {
                  alert(
                    "Le code que vous avez entré n'est pas valide, veuillez réessayer"
                  );
                  throw new Error("Erreur lors de la réservation");
                }
                return res.json();
              })
              .then((following) => {
                alert("Réservation réussie !");
                modal.style.display = "none";
                modal.querySelector(
                  ".modal-body-reservation"
                ).innerHTML = `<p>Réservation pour le ${dateFormatSlash} à ${formattedTimeToShow}</p><br>
                <form method="POST" class="form_reservation">
                  <input type="hidden" name="hour" value="${formattedTime}">
                  <input type="hidden" name="date" value="${date}">
                  <div>
                    <label for="name">Votre nom :</label>
                    <input type="text" name="name" id="name" required>
                  </div>
                  <div>
                    <label for="email">Votre email :</label>
                    <input type="email" name="email" id="email" required>
                  </div>
                  <button type="submit" id="sendIntoCalendar">Confirmer la réservation</button>
                </form>
                <p>Cliquez sur confirmer pour finaliser la réservation.</p>`;
                getSpecificHours(data.date);
              })
              .catch((err) => {
                console.log("Erreur", err);
              });
          });
        } else {
          console.log("Aucun résultat json renvoyé : erreur.");
        }
      })

      .catch((error) => {
        console.error(error);
        alert("Une erreur est survenue lors de la réservation.");
      });
  });
}

// Fermer la modal lorsque l'utilisateur clique en dehors de celle-ci ou sur un bouton de fermeture
document
  .querySelector(".modal-close-reservation")
  .addEventListener("click", function () {
    document.querySelector(".modal-reservation").style.display = "none";
  });

const codeinput = document.querySelector("#codeinput");
