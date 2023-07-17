const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log('Database connected!')
    } catch (error) {
        console.log('There vas an error');
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;