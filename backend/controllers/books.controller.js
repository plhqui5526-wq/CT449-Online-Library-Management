const BookService = require("../services/books.service");

exports.getAllBooks = async (req, res) => {
    let documents;

    try {
        const bookService = new BookService(req.app.locals.db);
        documents = await bookService.getAllBooks();
        return res.send(documents);
    } catch(error) {
        return res.status(500).json({
          message: "Internal server error",
        });
    }
}

