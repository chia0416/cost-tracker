const RecordModel = require('../models/record')
const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const UserModel = require('../models/user')
const category = require('../models/category')

const costController = {
  getRecordByList: (req, res) => {
    RecordModel.find()
      .populate('categoryId')
      .lean()
      .then(recordList => {
        recordList.forEach((data) => {
          data.date = data.date.toISOString().slice(0, 10)
          data.icon = data.categoryId.icon
        })
        res.render('index', { recordList })
      })
      .catch(err => console.error(err))
  },

  getRecordCreate: (req, res) => {
    const isCreatedPage = true;
    return res.render('create', { isCreatedPage })
  }


}

module.exports = costController