var socket = io();

window.onload = function() {
  let slogan = "Think fast. Think smart.";
  let heading = document.getElementById("slogan");
  animateText(slogan, 60, heading);
}

//Accordion Changelog:
let items = [...document.getElementsByClassName("item")];

items.forEach(el => el.addEventListener("click", e => {
  let subMenu = e.currentTarget.children[1];
  window.getComputedStyle(subMenu).getPropertyValue('height') == "0px" ?
    /* Height is 0px, change to shown state */
    ((e, subMenu) => {
      e.currentTarget.children[0].children[0].classList.toggle("collapsed");
      e.currentTarget.classList.toggle("collapsed")
      expandElement(subMenu, "collapsed")
    })(e, subMenu)
  :
    /* Height is auto, change to hidden */
    ((e, subMenu) => {
      e.currentTarget.children[0].children[0].classList.toggle("collapsed");
      expandElement(subMenu, "collapsed")
      e.currentTarget.classList.toggle("collapsed")
    })(e, subMenu);
}));

function expandElement(elem, collapseClass) {
  // debugger;
  elem.style.height = '';
  elem.style.transition = 'none';
  
  const startHeight = window.getComputedStyle(elem).height;
  
  // Remove the collapse class, and force a layout calculation to get the final height
  elem.classList.toggle(collapseClass);
  const height = window.getComputedStyle(elem).height;
  
  // Set the start height to begin the transition
  elem.style.height = startHeight;
  
  // wait until the next frame so that everything has time to update before starting the transition
  requestAnimationFrame(() => {
    elem.style.transition = '';
    
    requestAnimationFrame(() => {
        elem.style.height = height
    })
  })
  
  // Clear the saved height values after the transition
  elem.addEventListener('transitionend', () => {
    elem.style.height = '';
    elem.removeEventListener('transitionend', arguments.callee);
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

  Swal.fire({
    title: "Suggestion Sent!",
    text: "A member of our team will contact you back as soon as possible!",
    icon: "success",
    confirmButtonColor: "#000000",
    color: themeSettings["--content-text-color"][localStorage.getItem("theme")]
  });
});

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