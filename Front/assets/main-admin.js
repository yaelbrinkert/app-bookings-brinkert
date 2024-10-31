// Navbar Admin
// const app = require("../../Back/app");

const menuButtonNavAdmin = document.querySelector(".menu-open-nav-admin");
const navAdmin = document.querySelector(".navbar-admin");

// Fetching datas from db
const backEndUrl = "http://localhost:1234";

// Format de la date
function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mois de 1 à 12
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`; // Format YYYY-MM-DD
}

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

const dashboardContainer = document.querySelector(
  ".wrapper__dashboard__container"
);

async function showDatasWeeklyRendezvous(dateStart) {
  try {
    const response = await fetch(backEndUrl + "/bookings/weekly/" + dateStart, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur", err);
  }
}

async function showDatasForSpecificBooking(id) {
  try {
    const response = await fetch(backEndUrl + "/bookings/single/" + id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur", err);
  }
}

// Calcul des jours de la semaine (du lundi au dimanche)
function getDaysWhereWeekStartAndEnd(dateToStart) {
  const startDayOfWeek = new Date(dateToStart);
  const dayOfWeek = startDayOfWeek.getDay();

  const difference =
    startDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startDayOfWeek.setDate(difference);
  const endDayOfWeek = new Date(startDayOfWeek);
  endDayOfWeek.setDate(startDayOfWeek.getDate() + 6);

  return { startDayOfWeek, endDayOfWeek };
}

// Organiser les rendez-vous par jour de la semaine
function organizeAppointmentsByDay(appointments, startOfWeek) {
  const days = Array(7)
    .fill()
    .map((_, i) => new Date(startOfWeek.getTime() + i * 86400000)); // 7 jours à partir du lundi

  const appointmentsByDay = days.map((day) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === day.toDateString();
    });
  });

  return appointmentsByDay;
}

// Affichage des rendez-vous
async function showRendezvousForWeek(today) {
  const { startDayOfWeek } = getDaysWhereWeekStartAndEnd(today);

  let weekNumber = `Semaine du ${startDayOfWeek.toLocaleDateString()}`;
  dashboardContainer.innerHTML = `<div>
  <div class="wrapper__nav__weeks">
    <span class="navigate-week nav-week-left"
      ><i class="fa fa-chevron-left"></i
    ></span>
    <p class="current-week-text">${weekNumber}</p>
    <span class="navigate-week nav-week-right"
      ><i class="fa fa-chevron-right"></i
    ></span>
  </div>
  <table class="calendrier-admin">
    <thead>
      <tr>
        <th>Lundi</th>
        <th>Mardi</th>
        <th>Mercredi</th>
        <th>Jeudi</th>
        <th>Vendredi</th>
        <th>Samedi</th>
        <th>Dimanche</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td id="day-1"></td>
        <td id="day-2"></td>
        <td id="day-3"></td>
        <td id="day-4"></td>
        <td id="day-5"></td>
        <td id="day-6"></td>
        <td id="day-7"></td>
      </tr>
    </tbody>
  </table>
</div>`;

  // Attendre que les données soient récupérées
  const showDatasRendezvous = await showDatasWeeklyRendezvous(startDayOfWeek);

  // Organiser par jour
  const appointmentsByDay = organizeAppointmentsByDay(
    showDatasRendezvous,
    startDayOfWeek
  );

  // Afficher chaque jour dans le tableau
  appointmentsByDay.forEach((appointments, dayIndex) => {
    const dayCell = document.querySelector(`#day-${dayIndex + 1}`); // ID du jour correspondant dans le tableau
    dayCell.innerHTML = ""; // Réinitialiser le contenu

    appointments.forEach((appointment, appointmentIndex) => {
      const uniqueId = `modal-day-${dayIndex + 1}-number-${
        appointmentIndex + 1
      }`;

      const hourExplode = appointment.hour;
      let hourToShow = hourExplode.split(":");
      // Créer un élément <p>
      const appointmentElement = document.createElement("p");
      appointmentElement.className = "modal_day_number_element";
      appointmentElement.id = uniqueId;
      appointmentElement.innerHTML = `${appointment.name}<br><b>${hourToShow[0]}h${hourToShow[1]}</b>`;

      // const formatDateToSend = formatDate(new Date(appointment.date));

      // Ajouter un écouteur d'événement pour le clic
      appointmentElement.addEventListener("click", () => {
        openModalForTheDayAndNumberSelected(appointment.id);
      });

      // Ajouter l'élément dans le tableau
      dayCell.appendChild(appointmentElement);
    });
  });
  const navNextWeek = document.querySelector(".nav-week-right");
  const navPreviousWeek = document.querySelector(".nav-week-left");

  navNextWeek.addEventListener("click", async () => {
    const today = new Date(startDayOfWeek);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    showRendezvousForWeek(nextWeek);
  });

  navPreviousWeek.addEventListener("click", async () => {
    const today = new Date(startDayOfWeek);
    const previousWeek = new Date(today);
    previousWeek.setDate(today.getDate() - 7);
    showRendezvousForWeek(previousWeek);
  });
}

const today = new Date();
showRendezvousForWeek(today);

async function openModalForTheDayAndNumberSelected(rendezvousId) {
  const stockageOfId = rendezvousId;
  // Datas
  const datasWeekly = await showDatasForSpecificBooking(rendezvousId);

  //wrappers and css
  const modal__wrapper = document.querySelector(".wrapper__number__day");
  modal__wrapper.classList.add("active-modal");
  const modal__item__infos = document.querySelector(".modal__item__infos");

  datasWeekly.forEach((n) => {
    let successMessage = "";
    const dateBefore = new Date(n.date);
    const dateFormatted = formatDate(dateBefore);
    const splitDate = dateFormatted.split("-");
    const dateSlash = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;

    const hourForSplit = n.hour;
    const splitHour = hourForSplit.split(":");
    const hourSplitted = `${splitHour[0]}h${splitHour[1]}`;

    modal__item__infos.innerHTML = `<span class="close-modal-day-item"><i class="fa fa-xmark"></i></span>
    <p id="name_modal_item">${n.name}</p>
    <p id="email_modal_item">${n.email}</p>
    <br /><span id="date_modal_item">${dateSlash}</span>
    <p id="hour_modal_item"><b>${hourSplitted}</b></p>
    <button id="modify_hours_date">Modifier</button>`;

    const buttonModifyHoursDate = document.querySelector("#modify_hours_date");
    buttonModifyHoursDate.addEventListener("click", () => {
      modal__item__infos.innerHTML = `
      <span class="close-modal-day-item"><i class="fa fa-xmark"></i></span>
    <span class="backToModalInfos"><i class="fa fa-arrow-left"></i></span>
    <div><form method="POST" class="form_new_values_booking">
    <input type="date" name="dateToModify" value="${dateFormatted}">
    <input type="time" name="timeToModify" value="${hourForSplit}">
    <button type="submit" name="modifyValuesForBooking">Modifier</button>
    </form></div>
    <div><p class="success-message-modify-booking">${successMessage}</p></div>`;

      // Back to modal
      const backToModalInfos = document.querySelector(".backToModalInfos");
      backToModalInfos.addEventListener("click", () => {
        openModalForTheDayAndNumberSelected(stockageOfId);
      });

      // Close modal
      const close__modal = document.querySelector(".close-modal-day-item");
      close__modal.addEventListener("click", () => {
        modal__wrapper.classList.remove("active-modal");
      });

      // Form send new values
      const form = document.querySelector(".form_new_values_booking");
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        fetch(backEndUrl + "/bookings/" + n.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(data),
        })
          .then((res) => {
            if (res.ok) {
              successMessage =
                "La modification a bien été appliquée. <i class='fa fa-circle-check'></i><br><a href='admin.html'>Charger les modifications</a>";
              const successMessageElement = document.querySelector(
                ".success-message-modify-booking"
              );
              successMessageElement.innerHTML = successMessage;
              return res.json();
            }
          })
          .catch((err) => {
            console.error("Erreur:", err);
          });
      });
    });

    // Close modal
    const close__modal = document.querySelector(".close-modal-day-item");
    close__modal.addEventListener("click", () => {
      modal__wrapper.classList.remove("active-modal");
    });
  });
}

// async function datasRendezvousToShowWeekly() {}

async function datasRendezvousToShow() {
  try {
    const response = await fetch(backEndUrl + "/bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur", err);
  }
}

/* SHOW RENDEZVOUS EN LISTE */
// async function showRendezvous() {
//   const today = new Date();
//   const showDatasRendezvous = await datasRendezvousToShow();
//   dashboardContainer.innerHTML = "";
//   dashboardContainer.innerHTML +=
//     "<p style='text-align:center;'>A venir</p><br>";
//   let orderToShowDatasRdv = showDatasRendezvous.sort((a, b) => {
//     return new Date(a.date) - new Date(b.date);
//   });
//   orderToShowDatasRdv.forEach((datasRdv) => {
//     const rendezvousDate = new Date(datasRdv.date);
//     const dateFormattedRendezvous = formatDate(rendezvousDate);

//     let explodeDate = dateFormattedRendezvous.split("-");

//     const numberForMonths = Number(explodeDate[1]);
//     const monthsFromNumber = months[numberForMonths - 1];

//     // let explodedDateToShow = `${explodeDate[2]}/${explodeDate[1]}/${explodeDate[0]}`;
//     let explodedDateToShow = `${explodeDate[2]} ${monthsFromNumber} ${explodeDate[0]}`;

//     const rendezvousHour = datasRdv.hour;
//     let explodeHour = rendezvousHour.split(":");
//     let explodedHourToShow = `${explodeHour[0]}h${explodeHour[1]}`;

//     if (rendezvousDate >= today) {
//       dashboardContainer.innerHTML += `
//         <div class="wrapper__dashboard__container__rendezvous-item">
//           <p class="rendezvous-item-date_name">${explodedDateToShow} <span>${datasRdv.name}</span></p>
//           <p class="rendezvous-item-email"><a href="mailto:${datasRdv.email}">${datasRdv.email}<a/></p>
//           <p>${explodedHourToShow}</p>
//         </div>
//       `;
//     }
//   });
// }
// showRendezvous();
function renderSlotLongevity(slotLongevity) {
  let messageSuccessLongevity = "";
  return `
    <div>
      <p>Réglez la durée de vos créneaux (en min):</p><br>
      <form method="POST" class="form_slot_longevity">
      <input type="number" name="slot_longevity" step="5" value="${slotLongevity}">
      <button type="submit">Modifier</button>
      </form>
      <br>
      <p class="success_longevity">${messageSuccessLongevity}</p>
    </div>
  `;
}

function renderTimingForDays(
  day,
  startMorning,
  endMorning,
  startAfternoon,
  endAfternoon,
  isOpen
) {
  let nameOfTheDay = "";
  if (day === 0) {
    nameOfTheDay = "Dimanche";
  } else if (day === 1) {
    nameOfTheDay = "Lundi";
  } else if (day === 2) {
    nameOfTheDay = "Mardi";
  } else if (day === 3) {
    nameOfTheDay = "Mercredi";
  } else if (day === 4) {
    nameOfTheDay = "Jeudi";
  } else if (day === 5) {
    nameOfTheDay = "Vendredi";
  } else if (day === 6) {
    nameOfTheDay = "Samedi";
  }

  let showStartMorning = `<input type="time" name="start_time_morning" value="${startMorning}">`;

  let showEndMorning = `<input type="time" name="start_time_morning" value="${endMorning}">`;

  let showStartAfternoon = `<input type="time" name="start_time_morning" value="${startAfternoon}">`;

  let showEndAfternoon = `<input type="time" name="start_time_morning" value="${endAfternoon}">`;

  return `
  <div>
    <p><b>${nameOfTheDay}</b></p><span>Matin : </span>${showStartMorning}${showEndMorning}<br><span>Après-midi : </span>${showStartAfternoon}${showEndAfternoon}<br><br>
  </div>
  `;
}

async function showParams() {
  dashboardContainer.innerHTML = "";
  const id = localStorage.getItem("user_id");
  try {
    const response = await fetch(`${backEndUrl}/professional/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (data) {
      data.forEach((a) => {
        dashboardContainer.innerHTML += renderSlotLongevity(a.slot_longevity);
      });
    } else {
      console.error("Aucune donnée trouvée pour cet ID.");
    }
  } catch (err) {
    console.error("Erreur", err);
  }

  const formModifySlotLongevity = document.querySelector(
    ".form_slot_longevity"
  );
  formModifySlotLongevity.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(formModifySlotLongevity);
    const data = Object.fromEntries(formData.entries());

    const id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(backEndUrl + "/slotlongevity/" + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(data),
      });
      const resDatas = await res.json();

      const success_longevity = document.querySelector(".success_longevity");
      let messageSuccessLongevity =
        "Le temps des créneaux a bien été changé <i class='fa fa-circle-check'></i>";
      success_longevity.innerHTML = messageSuccessLongevity;

      return resDatas;
    } catch (error) {
      console.error("Erreur", error);
    }
  });

  try {
    const res = await fetch(backEndUrl + "/timings/" + id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const timings = await res.json();

    if (timings) {
      dashboardContainer.innerHTML += `<br><p>Réglez vos horaires pour chaques jours :</p><br><p><i>Utilisez minuit (00:00:00) dans les horaires de début et de fin d'une matinée ou d'une soirée pour désactiver cette dernière.</i></p><br>`;
      timings.forEach((a) => {
        dashboardContainer.innerHTML += renderTimingForDays(
          a.day_of_week,
          a.start_time_morning,
          a.end_time_morning,
          a.start_time_afternoon,
          a.end_time_afternoon,
          a.is_open
        );
      });
    } else {
      console.error("Aucune donnée trouvée pour cet ID.");
    }
  } catch (err) {
    console.error("Erreur", err);
  }
}

function showOthers() {
  dashboardContainer.innerHTML = "";
  dashboardContainer.innerHTML += "others";
}

const buttonNavDashboard = document.querySelectorAll(
  ".wrapper__dashboard__navbar__item"
);

buttonNavDashboard.forEach((button) => {
  button.addEventListener("click", function (event) {
    // First, remove the class from all buttons
    buttonNavDashboard.forEach((btn) =>
      btn.classList.remove("active-item-nav-dashboard")
    );

    // Then, add the class to the clicked button
    this.classList.add("active-item-nav-dashboard");
    let selectedDashboardItem = event.target.getAttribute("data-dashboard");

    if (selectedDashboardItem === "rendezvous") {
      const today = new Date();
      showRendezvousForWeek(today);
    } else if (selectedDashboardItem === "params") {
      showParams();
    } else if (selectedDashboardItem === "others") {
      showOthers();
    }
  });
});
