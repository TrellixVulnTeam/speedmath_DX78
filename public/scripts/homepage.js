var socket = io();

let suggestionsForm = document.getElementById("suggestionsForm");

suggestionsForm.addEventListener("submit", function(e) {
  e.preventDefault();

  let contact = document.getElementById("contact").value;
  let suggestion = document.getElementById("suggestion").value;

  socket.emit("suggestion", contact, suggestion);
  suggestionsForm.reset();

  if (localStorage.getItem("theme") === "dark") {
    Swal.fire({
      title: "Suggestion Sent!",
      text: "A member of our team will contact you back as soon as possible!",
      icon: "success",
      confirmButtonColor: "#000000",
      color: themeSettings.contentTextColor.dark
    });
  } else if (localStorage.getItem("theme") === "light") {
    Swal.fire({
      title: "Suggestion Sent!",
      text: "A member of our team will contact you back as soon as possible!",
      icon: "success",
      confirmButtonColor: "#000000",
      color: themeSettings.contentTextColor.light
    });
  }
});