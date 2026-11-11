const express = require("express");
const app = express();

app.get("/api/health", (req, res) => {
    res.json({status: "ok", service: "CT449-api"});
});

module.exports = app;