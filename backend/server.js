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

const allowedOrigins = [
 "http://localhost:3000",
 process.env.CLIENT_URL, // e.g. https://your-vercel-app.vercel.app
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,    // required for cross-site cookies
      httpOnly: true,
      sameSite: "none", // required for cross-site cookies
    },
  })
);

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

app.use(errorHandler);

const server = async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

server();
