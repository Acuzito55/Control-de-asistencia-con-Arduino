const express = require("express");
const Datastore = require("nedb");
var aspose = aspose || {};
aspose.cells = require("aspose.cells");

const app = express();
app.listen(3000);

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

console.log("Server is alive");

const students = new Datastore("students.db");
const planilla = new Datastore("planilla.db");
students.loadDatabase();
planilla.loadDatabase();

app.get("/students", (request, response) => {
  students.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

app.get("/planilla", (request, response) => {
  planilla.find({}).sort({ date: 1, year: 1, surname: 1 }).exec((err, data) => {
      if (err) {
        response.end();
        return;
      }
      response.json(data);
    });
});

app.post("/comparison", (request, response) => {
  students.find(
    { $or: [{ dni: request.body.dni }, { cardId: request.body.cardId }] },
    (err, docs) => {
      response.json({ number: docs.length });
    }
  );
});

app.post("/students", (request, response) => {
  console.log("Alumno añadido");
  students.insert(request.body);
  response.end();
});

const options = {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
  timeZoneName: "short"
};
const formatter = new Intl.DateTimeFormat("en-US", options);

const specialCard = 1555839049;

app.post("/punchIn", (request, response) => {
  console.log(request.body);
  let time = new Date();
  time = formatter.format(time);
  console.log(time);
  let d = time.substring(3, 5) + "/" + time.substring(0, 2);
  let h = time.substring(10, 15);
  if (request.body.cardId == specialCard) {
    console.log("Fin del dia");
    students.find({}, (err, allStudents) => {
      for(let s of allStudents){
        let doc = {
          dni: s.dni,
          name: s.name,
          surname: s.surname,
          year: s.year,
          hour: "-",
          date: d,
          asistencia: "Ausente"
        };
        let chance = true;
        planilla.find({ dni: s.dni }, (err, docs) => {
          for (let s of docs) {
            if (s.date == doc.date) {
              chance = false;
            }
          }
          if (chance) {
            planilla.insert(doc, function(err, newDoc) {});
          }
        });
      }
    });
  } else {
    students.findOne({ cardId: request.body.cardId }, (err, student) => {
      if (student) {
        let doc = {
          dni: student.dni,
          name: student.name,
          surname: student.surname,
          year: student.year,
          hour: h,
          date: d,
          asistencia: "Presente"
        };
        let chance = true;
        planilla.find({ dni: student.dni }, (err, docs) => {
          for (let s of docs) {
            if (s.date == doc.date) {
              chance = false;
            }
          }
          if (chance) {
            planilla.insert(doc, function(err, newDoc) {});
          }
        });
      } else {
        let doc = {
          dni: "Unknown",
          name: "Unknown",
          surname: "Unknown",
          year: "Unknown",
          hour: h,
          date: d,
          asistencia: "Presente"
        };
        planilla.insert(doc, function(err, newDoc) {});
      }
    });
  }
  response.end();
});

app.post("/deleteStudents", (request, response) => {
  console.log("Database edited");
  if (request.body.selected == "all") {
    students.remove({}, { multi: true }, function(err, numRemoved) {
      students.loadDatabase(function(err) {});
    });
  } else {
    students.remove({ _id: request.body.selected }, function(
      err,
      numRemoved
    ) {});
  }
  response.end();
});

app.post("/deletePlanilla", (request, response) => {
  if (request.body.selected == "all") {
    planilla.remove({}, { multi: true }, function(err, numRemoved) {
      planilla.loadDatabase(function(err) {});
    });
  }
  console.log("Database deleted");
  response.end();
});

app.get("/download", function(request, response) {
  planilla.find({}).sort({ date: 1, year: 1, surname: 1 }).exec((err, data) => {
    let workbook = new aspose.cells.Workbook(aspose.cells.FileFormatType.XLSX);
    let cells = workbook
      .getWorksheets()
      .get(0)
      .getCells();
    cells.get("A1").putValue("Apellido");
    cells.get("B1").putValue("Nombre");
    cells.get("C1").putValue("Año");
    cells.get("D1").putValue("Fecha");
    cells.get("E1").putValue("Hora");
    cells.get("F1").putValue("Asistencia");
    let n = 2;
    for (let doc of data) {
      cells.get("A" + n).putValue(doc.surname);
      cells.get("B" + n).putValue(doc.name);
      cells.get("C" + n).putValue(doc.year);
      cells.get("D" + n).putValue(doc.date);
      cells.get("E" + n).putValue(doc.hour);
      cells.get("F" + n).putValue(doc.asistencia);
      n++;
    }
    workbook.save("Planilla.xlsx");
    response.download("Planilla.xlsx", "Planilla.xlsx");
    console.log("Database downloaded");
  });
});
