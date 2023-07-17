const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'The name must have a maximum of 40 characters'],
        minlength: [10, 'The name must have a minimum of 10 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty must be either: Easy, medium or difficult"
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"]
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on NEW document creation, so it won't work on document update
                return val < this.price
            },
            message: "Discount price {VALUE} should be lower than the regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // This is for this to never being returned on a query
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
)

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})

// DOCUMENT MIDDLEWARE: runs before .save() and create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {
        lower: true
    })
    next()
})

// DOCUMENT MIDDLEWARE: runs before .save() and create()
tourSchema.pre('save', function(next) {
    console.log('New tour created!')
    next()
})

// DOCUMENT MIDDLEWARE: runs after .save() and create()
tourSchema.post('save', function(doc, next) {
    console.log(doc)
    next()
})

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } })

    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    console.log(docs)
    next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

    console.log(this.pipeline())
    next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour