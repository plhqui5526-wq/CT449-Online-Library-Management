const { connectDB, closeDB } = require("../utils/mongodb.util");

const publisher = {
  MaNXB: "NXB001",
  TenNXB: "NXB Trẻ",
  DiaChi: "TP. Hồ Chí Minh",
};

const book = {
  MaSach: "S001",
  TenSach: "Mắt biếc",
  DonGia: 100000,
  SoQuyen: 5,
  NamXuatBan: 2020,
  MaNXB: "NXB001",
  "NguonGoc/TacGia": "Nguyễn Nhật Ánh",
};

async function insertingPublisher(collection, data) {
  const existingPub = await collection.findOne({
    MaNXB: data.MaNXB,
  });

  if (!existingPub) {
    await collection.insertOne(data);
    console.log("Publisher inserted.");
  } else {
    console.log("Publisher already exists.");
  }
}

async function insertingBook(collection, data) {
  const existingBook = await collection.findOne({
    MaSach: data.MaSach,
  });

  if (!existingBook) {
    await collection.insertOne(data);
    console.log("Book inserted.");
  } else {
    console.log("Book already exists.");
  }
}

async function seedDatabase() {
  let connected = false;

  try {
    const db = await connectDB();
    connected = true;

    const publisherCollection = db.collection("NhaXuatBan");
    const bookCollection = db.collection("Sach");

    await insertingPublisher(publisherCollection, publisher);
    await insertingBook(bookCollection, book);

    const savedBook = await bookCollection.findOne({
      MaSach: "S001",
    });

    console.log("Saved book:", savedBook);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await closeDB();
    }
  }
}

seedDatabase();
