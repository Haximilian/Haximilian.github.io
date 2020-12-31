var records = new Object();
var journal = new Array();

// transaction should never be assigned an identifier of zero
var currentTransaction = 1;
var ongoingTransactions = new Array();

function initialize() {
  initializeRecords(8);
  displayRecords(records);
}

function initializeRecords(count) {
  var defaultKeys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  if (count > defaultKeys.length) {
    return;
  }

  for (i = 0; i < count; i++) {
    // if lock is equal to zero, no transaction holds the lock
    records[defaultKeys[i]] = {
      value: 0,
      lock: 0
    };
  }
}

function generateRecordsMarkup(toDisplay) {
  var markup = `
  <table>
    <tr>
      <td>key</td>
      <td>value</td>
      <td>lock</td>
    </tr>
  `;

  for (var key in toDisplay) {
    markup += `
      <tr>
        <td>${key}</td>
        <td>${toDisplay[key].value}</td>
        <td>${toDisplay[key].lock}</td>
      </tr>
    `;
  }

  markup += `
    </table>
  `;

  return markup;
}

function displayRecords(toDisplay) {
  var markup = generateRecordsMarkup(toDisplay);

  var recordsLocation = document.getElementById('records');
  recordsLocation.innerHTML = markup;
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

  for (var element of toDisplay) {
    var inner = document.createElement("p");
    inner.innerHTML = element;

    journalLocation.appendChild(inner);
  }
}

function startTransaction() {
  var toReturn = currentTransaction;
  currentTransaction += 1;

  // update on-going transaction set
  ongoingTransactions.push(toReturn);

  displayOnGoingTransactions(ongoingTransactions);

  // update output
  return toReturn;
}

function updateWrapper() {
  var transaction = document.getElementById("update-transaction");
  var key = document.getElementById("update-key");
  var value = document.getElementById("update-value");

  var transactionValue = parseInt(transaction.value);
  var keyValue = key.value;
  var valueValue = parseInt(value.value);

  transaction.value = "";
  key.value = "";
  value.value = ""

  if (transactionValue == "" || keyValue == "" || valueValue == "") {
    return;
  }

  if (!update(transactionValue, keyValue, valueValue)) {
    console.log("update: fail");
  }

  // update display
  displayJournal(journal);
  displayRecords(records);
}

function update(transaction, key, value) {
  // check if key exists
  if (!records.hasOwnProperty(key)) {
    return false;
  }

  // check if transaction exists
  if (!ongoingTransactions.includes(transaction)) {
    return false;
  }

  // acquire lock if available
  if (records[key].lock == 0) {
    records[key].lock = transaction;
  }

  if (records[key].lock == transaction) {
    // update journal
    journal.push(`{
      action: \"update\",
      key: \"${key}\",
      previousValue: ${records[key].value},
      currentValue: ${value},
      transaction: ${transaction}
    },`);

    // update record
    records[key].value = value;

    return true;
  }

  return false;
}

// commit...
// release all locks

// reboot method
// reset on-going transaction set
