var records;
var journal;
var ongoingTransactions;

var app;

// transaction should never be assigned an identifier of zero
var currentTransaction = 1;

function initialize() {
  records = initializeRecords(8);
  journal = new Array();
  currentTransaction = 1;
  ongoingTransactions = new Object();

  app = new Vue({
    el: "#application",
    data: {
      journal: journal,
      ongoingTransactions: ongoingTransactions,
      records: records
    }
  })
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
  var r = currentTransaction;
  currentTransaction += 1;

  // update on-going transaction set
  Vue.set(ongoingTransactions, r, {
    acquiredLocks: []
  });

  return r;
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
  Vue.delete(ongoingTransactions, t);
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
  abortTransactions(ongoingTransactions);
  releaseLocks(records);

  var toRollBack = uncommitedTransactions(journal);

  var reverseJournal = journal.slice().reverse();

  reverseJournal.forEach((element, i) => {
    var obj = JSON.parse(element)

    if (toRollBack.includes(obj.transaction) && obj.action == "update") {
      records[obj.key].value = obj.previousValue;
      journal.splice(reverseJournal.length - i - 1, 1);
    }
  });
}

// remove all properties of ongoing transaction object
// such that the removal is compatible with Vue
function abortTransactions(t) {
  for (var transactionKey in t) {
    Vue.delete(t, transactionKey);
  }
}

function releaseLocks(r) {
  for (var recordKey in r) {
    r[recordKey].lock = 0;
  }
}