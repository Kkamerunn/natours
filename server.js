const dotenv = require('dotenv')
dotenv.config({path : './config.env'})
const connectDB = require('./config/db')
const app = require('./app')

// connect to database
connectDB()

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`Listening from ${port}`)
})