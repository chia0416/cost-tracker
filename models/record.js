const mongoose = require('mongoose')
const Schema = mongoose.Schema

const recordSchema = new Schema({
  nameOfCost: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true,
    require: true
  },
  amount: {
    type: Number,
    min: 0,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    required: true
  },
  merchant: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    require: true
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    index: true,
    // require: true,
  },
  isPaidAlone:{
    type:Boolean
  }
})

module.exports = mongoose.model('Record', recordSchema)