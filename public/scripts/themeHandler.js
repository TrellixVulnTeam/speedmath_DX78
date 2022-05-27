let darkModeToggle = document.getElementById("darkModeToggle");

let themeSettings = {
  "bodyBackgroundColor": {
    "dark": "#292C35", 
    "light": "#F9E7E4"
  },
  "textColor": {
    "dark": "#ffffff",
    "light": "#000000"
  },
  "contentBackgroundColor": {
    "dark": "#00CAB1",
    "light": "#FCD5CE"
  },
  "contentTextColor": {
    "dark": "#000000",
    "light": "#000000"
  },
  "contentBorderColor": {
    "dark": "#ffffff",
    "light": "#000000"
  },
  "secondaryContentBackgroundColor": {
    "dark": "blue",
    "light": "red"
  },
  "secondaryContentTextColor": {
    "dark": "green",
    "light": "yellow"
  },
  "secondaryContentBorderColor": {
    "dark": "aquamarine",
    "light": "aquamarine"
  }
}

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
  
  changeTheme();
}

changeTheme();

function changeTheme() {
  if (localStorage.getItem("theme") == "dark") {
    document.body.style.backgroundColor = themeSettings.bodyBackgroundColor.dark;
    document.body.style.color = themeSettings.textColor.dark;
    
    document.querySelectorAll(".contentTheme").forEach(elem => {
      elem.style.backgroundColor = themeSettings.contentBackgroundColor.dark;
      elem.style.color = themeSettings.contentTextColor.dark;
      elem.style.borderColor = themeSettings.contentBorderColor.dark;
    });

    document.querySelectorAll(".secondaryContentTheme").forEach(elem => {
      elem.style.backgroundColor = themeSettings.secondaryContentBackgroundColor.dark;
      elem.style.color = themeSettings.secondaryContentTextColor.dark;
      elem.style.borderColor = themeSettings.secondaryContentBorderColor.dark;
    });
    
  } else {
    document.body.style.backgroundColor = themeSettings.bodyBackgroundColor.light;
    document.body.style.color = themeSettings.textColor.light;
    
    document.querySelectorAll(".contentTheme").forEach(elem => {
      elem.style.backgroundColor = themeSettings.contentBackgroundColor.light;
      elem.style.color = themeSettings.contentTextColor.light;
      elem.style.borderColor = themeSettings.contentBorderColor.light;
    });

    document.querySelectorAll(".secondaryContentTheme").forEach(elem => {
      elem.style.backgroundColor = themeSettings.secondaryContentBackgroundColor.light;
      elem.style.color = themeSettings.secondaryContentTextColor.light;
      elem.style.borderColor = themeSettings.secondaryContentBorderColor.light;
    });
  }
}
