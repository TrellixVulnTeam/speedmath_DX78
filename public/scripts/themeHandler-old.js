let darkModeToggle = document.getElementById("darkModeToggle");

let themeSettings = {
  "bodyBackgroundColor": {
    "dark": "#121212", 
    "light": "#FFF5DB"
  },
  "textColor": {
    "dark": "#ffffff",
    "light": "#000000"
  },
  "contentBackgroundColor": {
    "dark": "#ffb8ac",
    "light": "#C1DBCC"
  },
  "contentTextColor": {
    "dark": "#000000",
    "light": "#000000"
  },
  "contentBorderColor": {
    "dark": "#ffffff",
    "light": "#432818"
  },
  "secondaryContentBackgroundColor": {
    "dark": "#d4f6f2",
    "light": "#f08080"
  },
  "secondaryContentTextColor": {
    "dark": "#000000",
    "light": "#000000"
  },
  "secondaryContentBorderColor": {
    "dark": "#000000",
    "light": "#432818"
  },
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
  let hrs = document.getElementsByTagName("hr");
  
  if (localStorage.getItem("theme") == "dark") {
    document.body.style.backgroundColor = themeSettings.bodyBackgroundColor.dark;
    document.body.style.color = themeSettings.textColor.dark;

    [...hrs].forEach(hr => hr.color = themeSettings.textColor.dark);
    
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

    [...hrs].forEach(hr => hr.color = themeSettings.textColor.light);
    
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
