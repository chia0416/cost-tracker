const RecordModel = require('../models/record')
const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const UserModel = require('../models/user')
const tools = require('../public/javascripts/getDate')

const costController = {
  getRecordByList: async (req, res) => {
    try {
      //after register page finish change here
      const user = await UserModel.findOne()

      //for partnerId Category
      const partner = await PartnerModel.aggregate([
        { $project: { userId: 1, id: 1, name: 1 } },
        { $match: { userId: user._id } }
      ])
      //for start index
      const admin = await PartnerModel.findOne({ name: user.name })
      const keyPartnerId = req.query.partnerId
      let displayId = admin._id
      if (keyPartnerId) {
        displayId = keyPartnerId
      }

      //get certain record
      const recordList = await RecordModel.find({ partnerId: displayId }).populate('categoryId').lean()
      let totalAmount = 0
      recordList.forEach((data) => {
        totalAmount += data.amount
        data.date = data.date.toISOString().slice(0, 10)
        data.icon = data.categoryId.icon
      })

      res.render('index', { partner, recordList, totalAmount })
    } catch (e) {
      console.error(e)
    }
    // console.log(req.query)
    // return RecordModel.find()
    //   .populate('categoryId')
    //   .populate('partnerId')
    //   .lean()
    //   .then(recordList => {
    //     console.log(recordList)
    //     let totalAmount = 0
    //     recordList.forEach((data) => {
    //       totalAmount += data.amount
    //       data.date = data.date.toISOString().slice(0, 10)
    //       data.icon = data.categoryId.icon
    //     })
    //     res.render('index', { recordList, totalAmount })
    //   })
    //   .catch(err => console.error(err))
  },

  getRecordCreate: (req, res) => {
    Promise.all([CategoryModel.find().lean(), PartnerModel.find().lean()])
      .then(data => {
        const date = tools.getToday()
        const isCreatedPage = true
        const category = data[0]
        const partner = data[1]
        res.render('create', { isCreatedPage, date, category, partner })
      })
      .catch(err => console.error(err))
  },

  recordCreated: async (req, res) => {
    try {
      const { nameOfCost, date, categoryId, partnerId, merchant, amount, paidAlone, friendPaidAmount } = req.body
      if (amount < 0 || friendPaidAmount < 0) {
        return res.redirect('/record/new')
      }
      let userId = ''
      let anotherId = ''
      let isPaidAlone = true
      //get userId
      await PartnerModel.findById(partnerId)
        .then((data) => {
          userId = data.userId
        })

      if (!paidAlone) {
        isPaidAlone = false
        //get another Id for friendPaidAmount
        await PartnerModel.find({ userId }).then(
          (data) => {
            anotherId = data.find(d => d._id != partnerId)._id
          }
        )
        await RecordModel.create({
          nameOfCost: nameOfCost,
          date: date,
          categoryId: categoryId,
          merchant: merchant,
          amount: friendPaidAmount,
          userId: userId,
          partnerId: anotherId,
          isPaidAlone: paidAlone,
        })
      }

      await RecordModel.create({
        nameOfCost: nameOfCost,
        date: date,
        categoryId: categoryId,
        merchant: merchant,
        amount: amount,
        userId: userId,
        partnerId: partnerId,
        isPaidAlone: isPaidAlone,
      })

      return res.redirect('/')

    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = costController