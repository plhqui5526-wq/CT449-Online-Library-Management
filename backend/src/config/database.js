import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to the database: ", mongoose.connection.name);
    } catch(error) {
        console.error("Failed to connect to the database: ", mongoose.connection.name);
        process.exit(1);
    }
}