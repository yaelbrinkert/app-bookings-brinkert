document.addEventListener("DOMContentLoaded", function loadingAdminPage() {
  const welcomeAdmin = document.querySelector("#welcomeAdmin");
  const backEndUrl = "http://localhost:1234";

  const token = localStorage.getItem("token");
  if (token) {
    // Appel au serveur pour récupérer les informations de l'admin
    fetch(backEndUrl + "/verifyToken", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("User connected");
          nameOfTheAdmin(data.user.name);
        } else {
          console.error(
            "Erreur lors de la récupération des données de l'utilisateur"
          );
        }
      })
      .catch((error) => console.error("Erreur : ", error));
  } else {
    window.location.href = "./login.html";
  }

  function nameOfTheAdmin(name) {
    welcomeAdmin.innerHTML = `Bonjour, <span>${name}</span>.`;
  }
});

/* LOGOUT */

const buttonLogoutAdmin = document.querySelector(".logout-admin");
buttonLogoutAdmin.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.reload();
});
