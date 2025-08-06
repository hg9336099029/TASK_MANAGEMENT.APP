import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";
import session from "express-session";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// ✅ Middleware - CORS setup
const allowedOrigins = [
  //"http://localhost:3000", // ✅ Dev frontend
  "https://task-management-app-git-main-hg9336099029s-projects.vercel.app", // ✅ Prod frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true, // ✅ Allow cookies to be sent
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // send cookies only on HTTPS in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // important for cross-site
    },
  })
);

// ✅ Routes
const routeFiles = fs.readdirSync("./src/routes");
routeFiles.forEach((file) => {
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.error("Failed to load route file:", err);
    });
});

// ✅ Error handling middleware (after routes)
app.use(errorHandler);

// ✅ Start server
const server = async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

server();
