const express = require('express')
const morgan = require('morgan')
const AppError = require('./utils/apiErrors')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRouter')
const userRouter = require('./routes/userRouter')

const app = express()


// Middlewares (order in middlewares is quite important)
app.use(express.json())
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(express.static(`${__dirname}/public`))

/* app.use((req, res, next) => {
    console.log('Hello from the first middleware')
    next()
}) */

// app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', createTour)
// app.get('/api/v1/tours/:id', getTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    /* res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    }) */

    /* const err = new Error(`Can't find ${req.originalUrl} on this server!`)
    err.status = 'fail'
    err.statusCode = 404 */

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

module.exports = app