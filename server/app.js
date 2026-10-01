const express = require("express");

require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./DB/conn");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());

connectDB();

require("./model/userSchema");
require("./model/hallSchema");
require("./model/bookingSchema");
require("./model/propertySchema");

// IMPORTANT:
// favoriteRoutes must come before authRoutes.
// authRoutes contains the legacy POST "/:id/:token"
// password-reset route, which previously intercepted
// POST /favorites/:propertyId.
app.use(require("./router/favoriteRoutes"));

app.use(require("./router/authRoutes"));
app.use(require("./router/bookingRoutes"));
app.use(require("./router/hallRoutes"));

const propertyRoutes = require("./router/propertyRoutes");
app.use("/", propertyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
