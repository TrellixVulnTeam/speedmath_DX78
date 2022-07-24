let themeSettings = {
  "--scrollbar": {
    "-track-color": {
      "dark": "#121212",
      "light": "#FFF5DB"
    },
    "-thumb": {
      "-color": {
        "dark": "", // change this if u want
        "light": "#888"
      },
      "-color-hover": {
        "dark": "", // and this
        "light": "#555"
      }
    }
  },
  "--body-color": {
    "dark": "#121212",
    "light": "#FFF5DB"
  },
  "--text-color": {
    "dark": "#ffffff",
    "light": "#000000"
  },
  "--content": {
    "-background-color": {
      "dark": "#9a87a1", 
      "light": "#a0bbcf"
    },
    "-text-color": {
      "dark": "#000000",
      "light": "#000000"
    },
    "-border-color": {
      "dark": "#ffffff",
      "light": "#432818"
    }
  },
  "--secondary-content": {
    "-background-color": {
      "dark": "#ADC5C6",
      "light": "#975db6"
    },
    "-text-color": {
      "dark": "#000000",
      "light": "#000000"
    },
    "-border-color": {
      "dark": "#000000",
      "light": "#432818" 
    }
  },
  "contentBackgroundColor": {
    "dark": "#ffb8ac",
    "light": "#C1DBCC"
  },
  "contentTextColor": {
    "dark": "#000000",
    "light": "#000000"
  }
}

let darkModeToggle = document.getElementById("darkModeToggle");
if (localStorage.getItem("theme")) { //for returning users that have a theme for the site saved in their browser
  if (localStorage.getItem("theme") == "light") {
    darkModeToggle.checked = false;
  } else if (localStorage.getItem("theme") == "dark") {
    darkModeToggle.checked = true;
  }
} else { //for first-time users
  localStorage.setItem("theme", 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?
      "dark"
      :
      "light"
    );
}

darkModeToggle.onchange = function() {
  if (darkModeToggle.checked) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
  
  changeTheme(localStorage.getItem("theme"));
}

changeTheme(localStorage.getItem("theme"));

function changeTheme(theme) {
  let r = document.querySelector(':root'); // get root
  let dark = theme == "dark"
  
  function subChangeTheme(parent, a) {
    for (const property in a) {
      if (property == "dark" || property == "light") {
        // lowest depth in object
        r.style.setProperty(parent, a[dark ? "dark" : "light"])
      } else {
        // means we can still recurse through it
        subChangeTheme(`${parent}${property}`, a[property])
      }
    }
  }

  for (const property in themeSettings) {
    subChangeTheme(property, themeSettings[property])
  }
}


//technically this code is for the navbar but i'm putting it here because this file of code is applied to every page:

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function toggleResponsiveNavbar() {
  let navbar = document.querySelector(".topnav");
  navbar.classList.toggle("responsive");
}