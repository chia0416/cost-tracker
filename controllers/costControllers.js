const RecordModel = require('../models/record')
const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const UserModel = require('../models/user')
const category = require('../models/category')

const costController = {
  getRecordByList: (req, res) => {
    RecordModel.find()
      .populate('categoryId')
      .populate('userId')
      .populate('partnerId')
      .lean()
      .then(recordList => {
        recordList.forEach((data, index) => {
          data.date = data.date.toISOString().slice(0, 10)
          data.icon = data.categoryId.icon
          console.log(index)
          console.log('----------')
          console.log(data)
        })
        res.render('index', { recordList })
      })
      .catch(err => console.error(err))
  }
}

module.exports = costController