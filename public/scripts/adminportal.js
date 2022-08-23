var socket = io();

//initializing a bunch of variables to which we will assign values later as the person does stuff on the website
var adminPortalToken, selectedTable, possibleColumns, selectedColumns, orderBy;

let loginForm = document.getElementById("loginForm");
let password = document.getElementById("password");
let chooseDatabaseTableContainer = document.getElementById("chooseDatabaseTableContainer");
let viewAccountsDb = document.getElementById("viewAccountsDb");
let viewTopicPracticeDb = document.getElementById("viewTopicPracticeDb");
let interfaceContainer = document.getElementById("interfaceContainer");
let columnInput = document.getElementById("columnInput");
let addColumn = document.getElementById("addColumn");
let columnsList = document.getElementById("columnsList");
let table = document.getElementById("dataTable");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  
  socket.emit("adminPortal_login", password.value);
});

socket.on("adminPortal_successfullyLoggedIn", (token) => {
  chooseDatabaseTableContainer.style.display = "block";
  loginForm.style.display = "none";
  adminPortalToken = token;
});

viewAccountsDb.addEventListener("click", function() {
  socket.emit("adminPortal_getAccountsTableColumns", adminPortalToken);
  selectedTable = "users";
});

viewTopicPracticeDb.addEventListener("click", function() {
  socket.emit("adminPortal_getTopicPracticeTableColumns", adminPortalToken);
  selectedTable = "topicsPracticeStats";
});

socket.on("adminPortal_accountsTableColumns", function(data) {
  chooseDatabaseTableContainer.style.display = "none";
  interfaceContainer.style.display = "block";

  data.forEach(columnName => {
    let option = document.createElement("option");
    option.value = columnName;
    columnsList.appendChild(option);
  });

  possibleColumns = data;
  requestUserIdColumn();
});

socket.on("adminPortal_topicPracticeTableColumns", function(data) {
  chooseDatabaseTableContainer.style.display = "none";
  interfaceContainer.style.display = "block";

  data.forEach(columnName => {
    let option = document.createElement("option");
    option.value = columnName;
    columnsList.appendChild(option);
  });

  possibleColumns = data;
  requestUserIdColumn();
});

addColumn.addEventListener("click", function() {
  if (possibleColumns.includes(columnInput.value)) {
    if (selectedColumns.includes(columnInput.value)) {
      swalError("You have already selected this column!", "Please choose a different column name from the list of column names.")
    } else {
      selectedColumns.push(columnInput.value);
      socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(", "), orderBy);
    }
  } else {
    swalError("Invalid column name.", "Please choose a column name from the list of column names that comes up when you click on the input box.")
  }
  
  columnInput.value = "";
});

socket.on("adminPortal_tableData", function(data) {
  //clear table first:
  table.innerHTML = "";

  //first row of table (column names):
  let headerRow = table.insertRow();
  selectedColumns.forEach(columnName => {
    let th = document.createElement("th");
    
    if (orderBy.column === columnName) {
      if (orderBy.order == "DESC") {
        th.textContent = columnName + " 🠗";
      } else if (orderBy.order == "ASC") {
        th.textContent = columnName + " 🠕";
      }
    } else {
      th.textContent = columnName;
    }
    
    headerRow.appendChild(th);

    th.title = "Right-click to remove from view..."

    //click to sort by a column or change the order a column is sorted by
    th.addEventListener("click", function() {
      if (orderBy.column === columnName) { //if already being sorted by this column...
        //reverse the order:
        if (orderBy.order == "ASC") {
          orderBy.order = "DESC";
          socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(", "), orderBy);
        } else if (orderBy.order == "DESC") {
          orderBy.order = "ASC";
          socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(", "), orderBy);
        }
      } else {
        orderBy = {
          column: columnName,
          order: "ASC"
        }

        socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(", "), orderBy);
      }
    });

    //right click to remove column from view:
    th.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      
      if (selectedColumns.length > 1) {
        selectedColumns = removeElementFromArray(selectedColumns, columnName);
        if (orderBy.column === columnName) {
          orderBy = {
            column: selectedColumns[0],
            order: "ASC"
          };
        }

        socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(", "), orderBy);
      } else {
        swalError("Please keep at least one column in view.", "");
      }
    });
  }); 

  data.forEach(row => {
    let newRow = table.insertRow();
    Object.keys(row).forEach(key => {
      let cell = newRow.insertCell();
      cell.textContent = row[key];
    });
  });
});

socket.on("error", (errorTitle, errorMessage) => {
  swalError(errorTitle, errorMessage);
});

function swalError(errorTitle, errorMessage) {
  Swal.fire({
    title: errorTitle,
    text: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });
}

//this is like the default column that will be shown after the site mod/admin has picked a table to check
function requestUserIdColumn() {
  selectedColumns = ["user_id"];
  orderBy = {
    column: "user_id",
    order: "ASC"
  }
  socket.emit("adminPortal_requestColumns", adminPortalToken, selectedTable, selectedColumns.join(","), orderBy);
}

//source: https://stackoverflow.com/a/21688894/
function removeElementFromArray(arrOriginal, elementToRemove){
  return arrOriginal.filter(function(el){return el !== elementToRemove});
}