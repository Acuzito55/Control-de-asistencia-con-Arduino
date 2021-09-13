const refreshBtn = document.querySelector("#refresh");
refreshBtn.addEventListener("click", getStudents);

const removeBtn = document.querySelector("#delete");
removeBtn.addEventListener("click", eraseDb);

function eraseDb() {
  const data = { selected: "all" };
  const options1 = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  fetch("/deleteStudents", options1);
  getStudents();
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

  const response = await fetch("/students");
  const data = await response.json();
  const table = document.createElement("table");
  const properties = table.insertRow();
  properties.insertCell().textContent = "DNI";
  properties.insertCell().textContent = "Apellido";
  properties.insertCell().textContent = "Nombre";
  properties.insertCell().textContent = "Categoria";
  properties.insertCell().textContent = "Año";
  properties.insertCell().textContent = "Card-Id";
  properties.insertCell().textContent = "Eliminar";
  data.sort(function(a, b) {
    if(a.year == b.year){
     return a.surname.localeCompare(b.surname);
    }
    return b.year - a.year;
  });
  for (let item of data) {
    let row = table.insertRow();
    row.insertCell().textContent = item.dni;
    row.insertCell().textContent = item.surname;
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.rank;
    row.insertCell().textContent = item.year;
    row.insertCell().textContent = item.cardId;
    let xButton = document.createElement("button");
    xButton.innerHTML = "X";
    xButton.style.background = "none";
    xButton.style.border = "none";
    let b = row.insertCell();
    xButton.onclick = function () {
      let conf = confirm("¿Estás seguro que quieres eliminar a este usuario?");
      if(conf){
        const d = {selected: item._id};
        const options2 = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(d)
        };
        fetch("/deleteStudents", options2);
        getStudents();
      }
    };
    b.appendChild(xButton);
  }
  const container = document.querySelector(".contenedor");
  container.append(table);
}
