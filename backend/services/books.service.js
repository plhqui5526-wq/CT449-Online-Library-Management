class BookService {
    constructor(db) {
        this.Book = db.collection("Sach");
    }

    getAllBooks() {
        const cursor = this.Book.find({});
        const books = cursor.toArray();

        return books;
    }
}

module.exports = BookService;