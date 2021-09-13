const refreshBtn = document.querySelector("#refresh");
refreshBtn.addEventListener("click", getStudents);

const removeBtn = document.querySelector("#delete");
removeBtn.addEventListener("click", deleteDb);

const downloadBtn = document.querySelector("#download");
downloadBtn.addEventListener("click", downloadDb);

function deleteDb() {
  const data = { selected: "all" };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  fetch("/deletePlanilla", options);
  getStudents();
}

function downloadDb() {
  window.open("/download");
}

getStudents();

async function getStudents() {
  const previous = document.querySelectorAll("table");
  for (let p of previous) {
    p.parentNode.removeChild(p);
  }

  refreshBtn.disabled = true;
  removeBtn.disabled = true;
  setTimeout(() => {
    refreshBtn.disabled = false;
    removeBtn.disabled = false;
  }, 500);

  const response = await fetch("/planilla");
  const data = await response.json();
  const table = document.createElement("table");
  const properties = table.insertRow();
  properties.insertCell().textContent = "Apellido";
  properties.insertCell().textContent = "Nombre";
  properties.insertCell().textContent = "Año";
  properties.insertCell().textContent = "Fecha";
  properties.insertCell().textContent = "Hora";
  properties.insertCell().textContent = "Asistencia";
  
  for (let item of data) {
    let row = table.insertRow();
    row.insertCell().textContent = item.surname;
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.year;
    row.insertCell().textContent = item.date;
    row.insertCell().textContent = item.hour;
    row.insertCell().textContent = item.asistencia;
  }
  const container = document.querySelector(".contenedor");
  container.append(table);
}
