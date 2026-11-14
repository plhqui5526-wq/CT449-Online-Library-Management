const app = require("./app");
const {connectDB} = require("./utils/mongodb.util");
const PORT = process.env.PORT;


async function startServer() {
    try {
        const db = await connectDB();
        app.listen(PORT, () => {
            console.log("Server started");
        });
    } catch(error) {
        console.error("Connection failed: ", error);
        process.exit(1);
    }
}

startServer();

