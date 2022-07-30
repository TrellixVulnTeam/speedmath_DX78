var socket = io();
let discordInvite = "https://discord.gg/g4vrwMycWt";

let suggestionsForm = document.getElementById("suggestionsForm");

suggestionsForm.addEventListener("submit", function(e) {
  e.preventDefault();

  let contact = document.getElementById("contact").value;
  let suggestion = document.getElementById("suggestion").value;

  socket.emit("suggestion", contact, suggestion);
  suggestionsForm.reset();

  Swal.fire({
    title: "Suggestion Sent!",
    text: "A member of our team will contact you back as soon as possible!",
    icon: "success",
    confirmButtonColor: "#000000",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
});


let joinDiscord = document.getElementById("joinDiscord");

joinDiscord.addEventListener("click", function() {
  window.location.href = discordInvite;
});

let tosLink = document.getElementById("tosLink");

tosLink.addEventListener("click", function() {
  window.location.href = "/tos";
});