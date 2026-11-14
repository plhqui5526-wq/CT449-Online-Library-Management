const { connectDB, closeDB } = require("../utils/mongodb.util");

async function check() {
    let flag = false;
    try {
        const db = await connectDB();
        flag = true;
        const collections = await db.listCollections({}, { nameOnly: false }).toArray();
        for(const collection of collections) {
            console.log(collection.name);
            console.log(collection.options?.validator);

            const indexes = await db.collection(collection.name).indexes();
            for(const index of indexes) {
                console.log(index.name);
                console.log(index.key);
                console.log(index.unique === true);
            }
        }
    } catch(error) {
        console.log("Error: ", error);
        process.exitCode = 1;
    } finally {
        if(flag) {
            await closeDB();
        }
    }
    
}

check();