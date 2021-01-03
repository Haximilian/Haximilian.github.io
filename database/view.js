function displayRecords(r) {
  var table = document.createElement("table");

  recordsTableHeading(table);

  for (var key in r) {
    var row = document.createElement("tr");

    var keyField = document.createElement("td");
    keyField.innerHTML = key;
    row.appendChild(keyField);

    var valueField = document.createElement("td");
    valueField.innerHTML = r[key].value;
    row.appendChild(valueField);

    var lockField = document.createElement("td");
    lockField.innerHTML = r[key].lock;
    row.appendChild(lockField);

    table.appendChild(row);
  }

  document.getElementById('records').innerHTML = table.outerHTML;
}

function recordsTableHeading(table) {
    var row = document.createElement("tr")

    var keyField = document.createElement("th");
    keyField.innerHTML = "key";
    row.appendChild(keyField);
  
    var valueField = document.createElement("th");
    valueField.innerHTML = "value";
    row.appendChild(valueField);
  
    var lockField = document.createElement("th");
    lockField.innerHTML = "lock";
    row.appendChild(lockField);
  
    table.appendChild(row);
}

function updateKeyDropDown(availableKeys) {
  var element = document.getElementById('update-key')

  var markup = "";

  for (var key in availableKeys) {
    markup += `<option value=\"${key}\">${key}</option>`
  }

  element.innerHTML = markup;
}

function updateTransactionDropDown(availableTransactions) {
  var dropDownUpdate = document.getElementById('update-transaction')
  var dropDownCommit = document.getElementById('commit-transaction')

  var markup = "";

  for (var key in availableTransactions) {
    markup += `<option value=\"${key}\">${key}</option>`
  }

  dropDownUpdate.innerHTML = markup;
  dropDownCommit.innerHTML = markup;
}

function displayJournal(journalArray) {
  var container = document.createElement("ol");

  for (var element of journalArray) {
    var inner = document.createElement("li");
    inner.innerHTML = element;

    container.appendChild(inner);
  }

  var journalLocation = document.getElementById('journal');
  journalLocation.innerHTML = "";
  journalLocation.appendChild(container);
}

function displayOnGoingTransactions(toDisplay) {
  var journalLocation = document.getElementById('on-going-transaction');
  journalLocation.innerHTML = "";

  for (var element in toDisplay) {
    var inner = document.createElement("p");
    inner.innerHTML = element;

    journalLocation.appendChild(inner);
  }
}