const RecordModel = require('../models/record')
const CategoryModel = require('../models/category')
const PartnerModel = require('../models/partner')
const UserModel = require('../models/user')
const tools = require('../public/javascripts/getDate')
const store = require('store')
const categoryService = require('../service/categoryService')
const setUseId = '62b95dc93cb06f9a0d810dc7'
let count = 0

const costController = {
  getRecordByList: async (req, res) => {
    try {
      const recordDetail = await RecordModel.find({ userId: setUseId }).populate('categoryId').populate('userId').populate('partnerId').lean()

      //方法一
      function removeDuplicates(originalArray, ObjName, compareName) {
        let newArray = [];
        let lookupObject = {};

        for (let i in originalArray) {
          lookupObject[originalArray[i][ObjName][compareName]] = originalArray[i][ObjName]
          //解構賦值 (Destructuring assignment) 
          //let 特定名稱 = 指定的值 例：[a, b] = [10, 20];
        }

        for (i in lookupObject) {
          newArray.push(lookupObject[i]);
        }
        return newArray;
      }

      //方法二
      function removeDuplicatesBySet(oriArray, setName) {
        const set = new Set()
        let objArray = oriArray.filter((item) => {
          if (setName === 'date') {
            item[setName] = item[setName].toISOString().slice(0, 10)
          }
          return !set.has(item[setName]) ? set.add(item[setName]) : false
        })
        set.clear()
        return objArray = Array.from(objArray, (item) => {
          return item[setName]
        })
      }
      function removeDuplicatesBySet2(arr, sliceStart, sliceEnd) {
        const result = new Set();
        let newArr = arr.filter(item => {
          item = item.slice(sliceStart, sliceEnd)
          return !result.has(item) ? result.add(item) : false
        })
        return newArr = Array.from(newArr, (arr) => {
          return arr.slice(sliceStart, sliceEnd)
        })
      }
      const partnerArray = removeDuplicatesBySet(recordDetail, 'partnerId')
      const categoryArray = removeDuplicatesBySet(recordDetail, 'categoryId')
      const dateArray = removeDuplicatesBySet(recordDetail, 'date')
      const yearArray = removeDuplicatesBySet2(dateArray, 0, 4)
      const monthArray = removeDuplicatesBySet2(dateArray, 5, 7)
   
      /* ----get certain partnerId & month & year ----- */
      const nameQuery = req.query.partnerId
      const monthQuery = req.query.month
      const yearQuery = req.query.year
      const monthLeftQuery = req.query.monthLeft
      const monthRightQuery = req.query.monthRight
      const nameStore = store.get('nameStore')
      const monthStore = store.get('monthStore')
      const yearStore = store.get('yearStore')
      const date = tools.getToday()
      let displayId = ''
      let displayMonth = date.slice(5, 7)
      let displayYear = date.slice(0, 4)

      //get displayId
      if (nameQuery) {
        store.set('nameStore', { nameId: nameQuery })
        displayId = nameQuery
      } else if (nameStore) {
        displayId = nameStore.nameId
      } else {
        const user = await UserModel.findOne().lean()
        const admin = await PartnerModel.findOne({ name: user.name })
        displayId = admin._id
      }
      //get displayYear
      if (yearQuery) {
        displayYear = yearQuery
        store.set('yearStore', { yearId: yearQuery })
      } else if (yearStore) {
        displayYear = yearStore.yearId
      }
      //get displayMonth
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
      /* ----get certain partnerId & month & year ----- */

      const renderDate = recordDetail.filter(data => {
        const partnerId = data.partnerId._id
        const year = data.date.slice(0, 4)
        const month = data.date.slice(5, 7)
        return (String(partnerId) === String(displayId) && year === displayYear && month === displayMonth)
      })

      let totalAmount = 0
      renderDate.forEach((data) => {
        totalAmount += data.amount
      })
      //render partnerID 查詢名字
      const display = partnerArray.find(data => String(displayId) === String(data._id))

      res.render('index', { totalAmount, categories: categoryArray, recordList: renderDate, partner: partnerArray, monthList: monthArray, yearList: yearArray, displayYear, displayName: display.name, displayMonth, })
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
      const month = date.slice(5, 7)
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
      store.set('nameStore', { nameId: partnerId })
      store.set('monthStore', { monthId: month })

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