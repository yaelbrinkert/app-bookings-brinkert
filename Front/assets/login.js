const urlBackendHours = "http://localhost:1234";
// const buttonConnect = document.querySelector(".connectAdmin");
const form = document.querySelector(".formConnect");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  fetch(urlBackendHours + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.id);
        // Rediriger vers admin.html
        window.location.href = "admin.html";
      } else {
        alert(
          "Echec de la connexion, vérifiez vos identifiants et mot-de-passe."
        );
      }
    });
});
