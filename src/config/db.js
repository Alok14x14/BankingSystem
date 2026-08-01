const mongoose = require('mongoose');
const dns = require('dns');

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Ignore DNS override errors if in restricted environment
}

let isConnected = false;

async function connectDB() {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState === 1;
        console.log("Database connection successful");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw err;
    }
}

module.exports = connectDB;