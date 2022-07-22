const RecordModel = require('../models/record')
const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const UserModel = require('../models/user')
const tools = require('../public/javascripts/getDate')
const store = require('store')
const categoryService = require('../service/categoryService')

const costController = {
  getRecordByList: async (req, res) => {
    try {
      const categories = await CategoryModel.find().lean()
      //after register page finish change here
      const user = await UserModel.findOne().lean()

      //for partnerId Category
      const partner = await PartnerModel.find().lean()

      const nameQuery = req.query.partnerId
      const monthQuery = req.query.month
      const yearQuery = req.query.year
      const monthLeftQuery = req.query.monthLeft
      const monthRightQuery = req.query.monthRight

      const nameStore = store.get('nameStore')
      const monthStore = store.get('monthStore')
      const yearStore = store.get('yearStore')

      let displayId = ''
      //get displayId -first time -nameQuery -otherSearch
      if (nameQuery) {
        displayId = nameQuery
        //only when nameQuery  
        store.set('nameStore', { nameId: nameQuery })
      } else if (nameStore) {
        // no nameQuery
        displayId = nameStore.nameId
      } else {
        // no nameQuery && no nameStore
        const admin = await PartnerModel.findOne({ name: user.name })
        displayId = admin._id
      }

      const date = tools.getToday()
      //filter by year
      let displayYear = ''
      if (yearQuery) {
        displayYear = yearQuery
        store.set('yearStore', { yearId: yearQuery })
      } else if (yearStore) {
        displayYear = yearStore.yearId
      } else {
        displayYear = date.slice(0, 4)
      }

      //filter by month
      let displayMonth = date.slice(5, 7)
      if (monthQuery) {
        displayMonth = monthQuery
        store.set('monthStore', { monthId: monthQuery })
      } else if (monthStore) {
        displayMonth = monthStore.monthId
      }
      if (monthLeftQuery) {
        displayMonth = Number(displayMonth) - 1
        if (displayMonth < 10) {
          displayMonth = '0' + displayMonth
        }
        store.set('monthStore', { monthId: displayMonth })
      }
      if (monthRightQuery) {
        displayMonth = Number(displayMonth) + 1
        if (displayMonth < 10) {
          displayMonth = '0' + displayMonth
        }
        if (displayMonth > 10) {
          displayMonth = String(displayMonth)
        }
        store.set('monthStore', { monthId: displayMonth })
      }
      if (displayMonth > 12) {
        displayMonth = '01'
        displayYear = Number(displayYear) + 1
        store.set('monthStore', { monthId: displayMonth })
        store.set('yearStore', { yearId: displayYear })
      }
      if (displayMonth < 1) {
        displayMonth = '12'
        displayYear = Number(displayYear) - 1
        store.set('monthStore', { monthId: displayMonth })
        store.set('yearStore', { yearId: displayYear })
      }
      //for showDisplayName after get certain Id
      const display = await PartnerModel.findById(displayId)

      //filter by name 先找人在查月份（固定人不固定月份）
      let recordList = await RecordModel.find({ partnerId: displayId }).populate('categoryId').lean()

      // format the date
      let dateList = []
      recordList.forEach((data) => {
        data.date = data.date.toISOString().slice(0, 10)
        dateList.push(data.date.slice(0, 7))
        data.month = data.date.slice(5, 7)
        data.year = data.date.slice(0, 4)
      })

      //for display date by order
      dateList = dateList.filter((element, index, arr) => {
        return arr.indexOf(element) === index
      })
      let yearList = Array.from(dateList, date => date.slice(0, 4))
      let monthList = Array.from(dateList, date => date.slice(5, 7))
      yearList = [...(new Set(yearList))]
      monthList = [...(new Set(monthList))]
      monthList = monthList.sort((a, b) => a - b)

      //get filter recordList
      recordList = recordList.filter(data => {
        if (data.month === displayMonth && data.year === displayYear) {
          return data
        }
      })
      let totalAmount = 0
      recordList.forEach((data) => {
        totalAmount += data.amount
      })

      res.render('index', { partner, recordList, totalAmount, monthList, yearList, displayName: display.name, displayYear, displayMonth, categories })
    } catch (e) {
      console.error(e)
    }
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
          isPaidAlone: isPaidAlone,
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
  },

  getRecordEdit: (req, res) => {
    const id = req.params.id
    const isEditedPage = true
    RecordModel.findById(id)
      .lean()
      .then(record => {
        categoryService.getCategoriesAndPartner(req, res, (data) => {
          const cateId = record.categoryId
          const date = record.date.toISOString().slice(0, 10)
          const categories = data.category
          const partners = data.partner
          res.render('edit', { record, isEditedPage, date, category: categories, partner: partners, cateId })
        })
      })
      .catch(error => console.error(error))

  },

  recordEdited: (req, res) => {
    const id = req.params.id
    const { nameOfCost, date, categoryId, partnerId, merchant, amount } = req.body
    return RecordModel.findById(id)
      .then(record => {
        record.nameOfCost = nameOfCost
        record.date = date
        record.categoryId = categoryId
        record.merchant = merchant
        record.amount = amount
        record.partnerId = partnerId
        return record.save()
      })
      .then(() => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
  },

  recordDelete: (req, res) => {
    const id = req.params.id
    return RecordModel.findById(id)
      .then(record => record.remove())
      .then(() => res.redirect('/'))
      .catch((e) => console.error(e))
  }
}

module.exports = costController