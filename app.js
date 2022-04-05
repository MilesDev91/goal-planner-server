import express from "express";
import http from "http";
import logger from "morgan";
import path from "path";
import { notFound, errorHandler } from "./middleware/error";

const { json, urlencoded } = express;

const app = express();
const server = http.createServer(app);

module.exports = { app, server };

if (process.env.NODE_ENV === "development") {
  server.listen(process.env.PORT, (err, res) => {
    if (err) return console.log(err);
    console.log("server is listening...");
  });
  app.use(logger("dev"));
}
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  server.listen(process.env.PORT);

  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname), "client", "build", "index.html")
  );
} else {
  app.get("/", (req, res) => res.send("API is running"));
}

app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server };
