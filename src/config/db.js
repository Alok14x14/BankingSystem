const mongoose = require('mongoose');

function connectDB () {

  
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Database connection successful");
        })
        .catch((err) => {
            console.log("Database connection failed");
            process.exit(1);
        })

}

module.exports = connectDB;