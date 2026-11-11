const app = require("./app");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const client = new MongoClient(uri);

async function startServer() {
    try {
        await client.connect();
        console.log("Connected.");
        app.listen(PORT, () => {
            console.log("Server started");
        });
    } catch(error) {
        console.error("Connection failed: ", error);
        process.exit(1);
    }
}

startServer();

