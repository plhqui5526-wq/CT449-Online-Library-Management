const express = require("express");
const app = express();
const bookRouter = require("./src/routes/books.route");

app.get("/api/health", (req, res) => {
    res.json({status: "ok", service: "CT449-api"});
});

app.use("/api/books", bookRouter);

module.exports = app;