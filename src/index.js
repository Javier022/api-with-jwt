const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// coors
var corsOptions = {
  origin: "*", //remplaazar con dominio
  optionssuccessStatus: 200,
};

app.use(cors(corsOptions));

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos

const uri = `mongodb+srv://api-jwt:${process.env.PASSWORD}@cluster0.4xipe.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("todo fine"))
  .catch((e) => console.log("El error es: ", e));

// import routes
const authRoutes = require("./routes/auth");
const validateToken = require("./routes/validate-token");
const admin = require("./routes/admin");

// route
app.use("/api/user", authRoutes);

// route with middleware
app.use("/api/admin", validateToken, admin);

// example
app.get("/", (req, res) => {
  res.json({
    estado: true,
    mensaje: "funciona!",
  });
});

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`servidor andando en: ${PORT}`);
});
