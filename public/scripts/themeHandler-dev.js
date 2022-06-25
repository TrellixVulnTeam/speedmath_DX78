let themeSettings = {
  "--scrollbar": {
    "-track-color": {
      "dark": "", // change this
      "light": "#f1f1f1"
    },
    "-thumb": {
      "-color": {
        "dark": "",
        "light": "#888"
      },
      "-color-hover": {
        "dark": "",
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
      "dark": "#ffb8ac",
      "light": "#C1DBCC"
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
      "dark": "#d4f6f2",
      "light": "#f08080"
    },
    "-text-color": {
      "dark": "#000000",
      "light": "#000000"
    },
    "-border-color": {
      "dark": "#000000",
      "light": "#432818"
    }
  }
}

let darkModeToggle = document.getElementById("darkModeToggle");
let theme = localStorage.getItem("theme");
if (theme) {
  darkModeToggle.checked = theme == "dark"
} else {
  localStorage.setItem("theme", "light");
}

darkModeToggle.onchange = function() {
  if (darkModeToggle.checked) {
    localStorage.setItem("theme", "dark");
    theme = "dark"
  } else {
    localStorage.setItem("theme", "light");
    theme = "light"
  }
  
  changeTheme(theme);
}

changeTheme(theme);

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