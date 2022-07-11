const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const tools = require('../public/javascripts/getDate')

let categoryService = {
  getCategoriesAndPartner: (req, res, callback) => {
    return Promise.all([CategoryModel.find().lean(), PartnerModel.find().lean()])
        .then(data => {
          const date = tools.getToday()
          const category = data[0]
          const partner = data[1]
          callback({ date, category, partner })
        })
      .catch(err => console.error(err))
  }
}

module.exports = categoryService