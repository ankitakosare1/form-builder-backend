const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

const app = express();

dotenv.config();

//DB Connection
connectDB();

//Port
const port = process.env.PORT || 4000

//Require Routes
const userRoutes = require("./routes/userRoutes")
const otpRoutes = require("./routes/otpRoutes");
const projectRoutes = require("./routes/projectRoutes");
const formRoutes = require("./routes/formRoutes");
const responseRoutes = require("./routes/responseRoutes");
const workRoutes = require("./routes/workRoutes");
const analyticsRoutes = require("./routes/analytics");


//Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json()); //To parse JSON requests

//Routes
app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/form", formRoutes);
app.use("/api/response", responseRoutes);
app.use("/api/works", workRoutes);
app.use("/api/analytics", analyticsRoutes);

//Start the Server
app.listen(port, () => {
    console.log(`Server is running at PORT: ${port}`);
})
