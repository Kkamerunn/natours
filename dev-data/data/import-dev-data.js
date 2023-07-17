const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config({path : 'config.env'})
const connectDB = require('../../config/db')
const Tour = require('../../models/tourModel')

// connect to database
connectDB()

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data successfully loaded')
    } catch (error) {
        console.log(error)
    }
    process.exit()
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data successfully deleted')
    } catch (error) {
        console.log(error)
    }
    process.exit()
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}