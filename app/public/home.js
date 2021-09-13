let inpDni, inpSurname, inpName, inpRank, inpYear, inpCard, addBtn;

inpDni = document.querySelector("#dni");
inpSurname = document.querySelector("#surname");
inpName = document.querySelector("#name");
inpRank = document.querySelector("#rank");
inpYear = document.querySelector("#year");
inpCard = document.querySelector("#card");

let rank1 = document.createElement("option");
let rank2 = document.createElement("option");
rank1.appendChild(document.createTextNode("Estudiante"));
rank2.appendChild(document.createTextNode("Profesor"));
rank1.value = "Estudiante";
rank2.value = "Profesor";
inpRank.appendChild(rank1);
inpRank.appendChild(rank2);

inpRank.addEventListener("change", event => {
  if (inpRank.value == "Estudiante") {
    inpYear.options[0].selected = true;
  }
  if (inpRank.value == "Profesor") {
    inpYear.options[6].selected = true;
  }
});

for (let i = 1; i <= 6; i++) {
  let opt = document.createElement("option");
  opt.appendChild(document.createTextNode(i + "°"));
  opt.value = i + "°";
  inpYear.appendChild(opt);
}
let lastOpt = document.createElement("option");
lastOpt.appendChild(document.createTextNode("No aplica"));
lastOpt.value = "No aplica";
inpYear.appendChild(lastOpt);

addBtn = document.querySelector("#send");
addBtn.addEventListener("click", addStudent);

function addStudent() {
  const options1 = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ dni: inpDni.value, cardId: inpCard.value })
  };
  fetch("/comparison", options1).then(response => {
    response.json().then(matches => {
      if (
        inpDni.value != "" &&
        !isNaN(inpDni.value) &&
        inpDni.value.toString().length == 8
      ) {
        if (matches.number == 0) {
          if (inpName.value != "" && inpSurname.value != "") {
            if (
              (inpRank.value == "Profesor" && inpYear.value == "No aplica") ||
              (inpRank.value == "Estudiante" && inpYear.value != "No aplica")
            ) {
              const data = {
                dni: inpDni.value,
                surname: inpSurname.value,
                name: inpName.value,
                rank: inpRank.value,
                year: inpYear.value,
                cardId: inpCard.value
              };
              const options2 = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
              };
              fetch("/students", options2);
              inpDni.value = "";
              inpName.value = "";
              inpSurname.value = "";
              inpCard.value = "";
            } else {
              alert(
                `La opción "No aplica" esta reservada para los profesores, por favor introduzca la opción correcta.`
              );
            }
          } else {
            alert("Por favor, introduzca nombre y apellido.");
          }
        } else {
          alert(
            "Por favor, introduzca un DNI y Card-Id que no pertenezcan a usuarios ya existentes."
          );
        }
      } else {
        alert("Por favor, introduzca un DNI válido.");
      }
    });
  });
}