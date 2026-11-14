const express = require("express");
const books = require("../controllers/books.controller");

const router = express.Router();

router
    .route("/")
    .get(books.getAllBooks);

module.exports = router;