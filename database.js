var records = new Object();
var journal = new Array();

// transaction should never be assigned an identifier of zero
var currentTransaction = 1;

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
  var container = document.createElement("ul");

  for (var element of journalArray) {
    var inner = document.createElement("li");
    inner.innerHTML = element;

    container.appendChild(inner);
  }

  var journalLocation = document.getElementById('journal');
  journalLocation.innerHTML = "";
  journalLocation.appendChild(container);
}

function main() {
  initializeRecords(8);

  displayRecords(records);

  journal.push("hello");
  displayJournal(journal);
}
