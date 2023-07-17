// const fs = require('fs')
const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

// File read
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Just for middlewares
// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "fail",
//             message: "Missing name or price"
//         })
//     }
//     next()
// }

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-price,-ratingAverage,duration';
    req.query.fields = 'name,ratingAverage,summary,difficulty,price';
    next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    // BUILD QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()

    // EXECUTE QUERY
    const tours = await features.query

    // const tours = await Tour.find()
    //                         .where('duration')
    //                         .equals(5)
    //                         .where('difficulty')
    //                         .equals('easy')

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})

    // THE WAY WE ARE DOING IT FROM NOW ON

    // const newTour = new Tour({})
    // newTour.save()


 // THE OLD WAY TO DO IT
    // const newId = tours[tours.length - 1].id + 1
    // const newTour = Object.assign({id: newId}, req.body)

    // tours.push(newTour)
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "success",
    //         data: {
    //             tour: newTour
    //         }
    //     })
    // })

exports.deleteTour = catchAsync(async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id)
    
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingQuantity' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ])
        
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year = 1

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}