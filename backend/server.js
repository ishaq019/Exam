const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const orig = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400) {
      console.log(`[${res.statusCode}] ${req.method} ${req.path}`, JSON.stringify(body));
    }
    return orig(body);
  };
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api", questionRoutes);
app.use("/api/student", attemptRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
  });