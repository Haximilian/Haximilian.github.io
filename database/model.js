var records;
var journal = new Array();

// transaction should never be assigned an identifier of zero
var currentTransaction = 1;
var ongoingTransactions = new Object();

function initialize() {
  records = initializeRecords(8);
  displayRecords(records);
  updateKeyDropDown(records);
}

function initializeRecords(count) {
  var records = new Object();

  var defaultKeys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  if (count > defaultKeys.length) {
    return;
  }

  for (i = 0; i < count; i++) {
    // if lock is zero, no transaction holds the lock
    records[defaultKeys[i]] = {
      value: 0,
      lock: 0
    };
  }

  return records;
}

function startTransaction() {
  var toReturn = currentTransaction;
  currentTransaction += 1;

  // update on-going transaction set
  ongoingTransactions[toReturn] = {
    acquiredLocks: []
  };

  displayOnGoingTransactions(ongoingTransactions);
  updateTransactionDropDown(ongoingTransactions);

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

  // check if transaction is ongoing
  if (!ongoingTransactions.hasOwnProperty(transaction)) {
    return false;
  }

  // acquire lock if available
  if (records[key].lock == 0) {
    records[key].lock = transaction;
    ongoingTransactions[transaction].acquiredLocks.push(key);
  }

  if (records[key].lock == transaction) {
    // update journal
    journal.push(`{
      \"action\": \"update\",
      \"key\": \"${key}\",
      \"previousValue\": ${records[key].value},
      \"currentValue\": ${value},
      \"transaction\": ${transaction}
    }`);

    // update record
    records[key].value = value;

    return true;
  }

  return false;
}

function commitWrapper() {
  var transaction = document.getElementById("commit-transaction");

  var transactionValue = parseInt(transaction.value);

  transaction.value = "";

  commit(transactionValue);

  // update display
  displayRecords(records);
  displayOnGoingTransactions(ongoingTransactions);
  displayJournal(journal);
  updateTransactionDropDown(ongoingTransactions);
}

function commit(t) {
  // check if transaction is ongoing
  if (!ongoingTransactions.hasOwnProperty(t)) {
    return false;
  }

  // wait for all updates to persist in non-volatile memory

  // write journal entry
  journal.push(`{
      \"action\": \"commit\",
      \"transaction\": ${t}
    }`
  );

  // release all locks held by transaction
  for (var recordKey of ongoingTransactions[t].acquiredLocks) {
    records[recordKey].lock = 0;
  }

  // update ongoing transactions
  delete ongoingTransactions[t];
}

// given the journal, returns a list on of uncommited transactions
function uncommitedTransactions(journal) {
  allTransactions = new Set();
  commitedTransactions = new Set();

  for (var element of journal) {
    var object = JSON.parse(element);

    allTransactions.add(object.transaction);
    if (object.action == "commit") {
      commitedTransactions.add(object.transaction);
    }
  }

  var r = new Array();

  allTransactions.forEach(elem => {
    if (!commitedTransactions.has(elem)) {
      r.push(elem);
    }
  });

  return r;
}

function systemCrash() {
  ongoingTransactions = [];
  releaseLocks(records);

  var toRollBack = uncommitedTransactions(journal);

  var reverseJournal = journal.reverse();
  var newJournal = reverseJournal;

  reverseJournal.forEach((element, i) => {
    var obj = JSON.parse(element)

    if (toRollBack.includes(obj.transaction) && obj.action == "update") {
      records[obj.key].value = obj.previousValue;
      delete newJournal[i];
    }
  });

  journal = newJournal.reverse().filter(Boolean);

  displayJournal(journal);
  displayRecords(records);
  displayOnGoingTransactions(ongoingTransactions);
  updateTransactionDropDown(ongoingTransactions);
}

function releaseLocks(r) {
  for (var recordKey in r) {
    r[recordKey].lock = 0;
  }
}

// display state ~ calls all display methods
// use textbox ~ output box
// drop down box for transaction and entries


// link database site on main site


// anotation
// how to use the tool

// cleanup variable names 
// remove global variables

// reboot method
// reset on-going transaction set


// table styling and centering