var socket = io();

window.onload = function() {
  let slogan = "Think fast. Think smart.";
  let heading = document.getElementById("slogan");
  animateText(slogan, 60, heading);
}

//params: text to animate, speed (time per character in milliseconds), element to add text to
function animateText(text, speed, element) {
  return new Promise((resolve, reject) => {
    let i = 0;
    var animate = setInterval(() =>{
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(animate);
        resolve();
      }
    }, speed);
  });
}

//Suggestions:
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