const mongoose = require('mongoose')
const Schema = mongoose.Schema
const partnerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('Partner', partnerSchema)