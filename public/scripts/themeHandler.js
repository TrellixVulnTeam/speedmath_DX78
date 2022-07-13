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
if (localStorage.getItem("theme")) {
  if (localStorage.getItem("theme") == "light") {
    darkModeToggle.checked = false;
  } else if (localStorage.getItem("theme") == "dark") {
    darkModeToggle.checked = true;
  }
} else {
  localStorage.setItem("theme", "light");
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