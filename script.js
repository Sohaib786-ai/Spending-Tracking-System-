const tableBody = document.getElementById("tracker-table");
const totalSavedElement = document.getElementById("total-saved");
const recommendationText = document.getElementById("recommendation-text");
const progressBar = document.getElementById("progress-bar");

let totalDays = parseInt(document.getElementById("total-days").value);
let savingsGoal = parseFloat(document.getElementById("savings-goal").value);
let dailyPayment = parseFloat(document.getElementById("daily-payment").value);
let weekendPayment = parseFloat(document.getElementById("weekend-payment").value);

let totalSaved = 0;
let remainingDays = totalDays;

// Load or initialize data
const savedData = JSON.parse(localStorage.getItem("trackerData")) || [];
savedData.forEach(addRowToTable);

updateTotalSaved();
updateRecommendation();

// Update settings
document.getElementById("update-settings").addEventListener("click", () => {
  totalDays = parseInt(document.getElementById("total-days").value);
  savingsGoal = parseFloat(document.getElementById("savings-goal").value);
  dailyPayment = parseFloat(document.getElementById("daily-payment").value);
  weekendPayment = parseFloat(document.getElementById("weekend-payment").value);
  remainingDays = totalDays - savedData.length;
  updateRecommendation();
});

// Add or update spending entry
document.getElementById("add-entry").addEventListener("click", () => {
  const dateInput = document.getElementById("date").value;
  const spentInput = document.getElementById("spent").value;

  if (!dateInput || !spentInput || spentInput < 0) {
    alert("Please enter valid date and spending amount.");
    return;
  }

  const date = new Date(dateInput).toLocaleDateString();
  const day = new Date(dateInput).toLocaleDateString("en-US", { weekday: "long" });
  const isWeekend = day === "Friday" || day === "Saturday";
  const payment = isWeekend ? weekendPayment : dailyPayment;

  const spent = parseFloat(spentInput);
  const existingEntry = savedData.find((entry) => entry.date === date);

  if (existingEntry) {
    existingEntry.spent += spent;
    existingEntry.saved = payment - existingEntry.spent;
  } else {
    const saved = payment - spent;
    const entry = { date, day, payment, spent, saved };
    savedData.push(entry);
    remainingDays--;
  }

  localStorage.setItem("trackerData", JSON.stringify(savedData));
  reloadTable();
});

// Reset data
document.getElementById("reset").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    localStorage.removeItem("trackerData");
    location.reload();
  }
});

// Reload table
function reloadTable() {
  tableBody.innerHTML = "";
  savedData.forEach(addRowToTable);
  updateTotalSaved();
  updateRecommendation();
}

// Add row to table
function addRowToTable(entry) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.day}</td>
    <td>${entry.payment}</td>
    <td>${entry.spent}</td>
    <td>${entry.saved}</td>
    <td><button class="edit-btn" data-date="${entry.date}">Edit</button></td>
  `;
  tableBody.appendChild(row);

  row.querySelector(".edit-btn").addEventListener("click", () => {
    const newSpent = prompt("Enter new spent amount:", entry.spent);
    if (newSpent !== null && !isNaN(newSpent)) {
      entry.spent = parseFloat(newSpent);
      entry.saved = entry.payment - entry.spent;
      localStorage.setItem("trackerData", JSON.stringify(savedData));
      reloadTable();
    }
  });
}

// Update total saved
function updateTotalSaved() {
  totalSaved = savedData.reduce((sum, entry) => sum + entry.saved, 0);
  totalSavedElement.textContent = totalSaved.toFixed(2);
  const progress = Math.min((totalSaved / savingsGoal) * 100, 100);
  progressBar.style.width = `${progress}%`;
}

// Update recommendation
function updateRecommendation() {
  const remainingSavingsGoal = savingsGoal - totalSaved;
  const recommendedDailySaving =
    remainingSavingsGoal > 0 && remainingDays > 0
      ? (remainingSavingsGoal / remainingDays).toFixed(2)
      : 0;

  recommendationText.textContent =
    remainingSavingsGoal > 0
      ? `To reach your goal, save PKR ${recommendedDailySaving} per day for the next ${remainingDays} days.`
      : "Congratulations! You've reached your savings goal.";
}
