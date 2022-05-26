const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const { API_VERSION } = require("./config");

const userRoutes = require("./src/routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

/* Creación de los endpoint del proyecto */
app.use(`/api/${API_VERSION}`, userRoutes);

/* Condiguración de los header HTTP */
module.exports = app;