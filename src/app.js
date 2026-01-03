const express = require("express");
const cors = require("cors");
const subscriptionRoutes = require("./routes/subscription.route");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use(errorHandler);

module.exports = app;
