const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
    await client.connect();

    const db = client.db("OnlineLibrary");
    console.log(db.databaseName);
    console.log("Connected.");

    return db;
}

async function closeDB() {
  await client.close();
}

module.exports = { connectDB, closeDB };