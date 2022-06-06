const db = require('../../config/mongoose')
const CategoryModel = require('../category')
const RecordModel = require('../record')
const UserModel = require('../user')
const PartnerModel = require('../partner')

const SEED_USER = {
  name: 'Miki',
}
const SEED_PARTNER = {
  name: 'MA',
}

const RecordList = [
  {
    nameOfCost: '牛奶',
    date: Date.now(),
    amount: '80',
    merchant: 'lawson',
    isPaidAlone: true,
  },
  {
    nameOfCost: '電車',
    date: Date.now(),
    amount: '60',
    isPaidAlone: true,
  },
  {
    nameOfCost: '家賃',
    date: Date.now(),
    amount: '120',
    isPaidAlone: true,
  },
  {
    nameOfCost: '旅行',
    date: Date.now(),
    amount: '8000',
    isPaidAlone: true,
  },
  {
    nameOfCost: '服',
    date: Date.now(),
    amount: '10000',
    merchant: 'GU',
    isPaidAlone: false,
  }]

db.once('open', async () => {
  try {
    await UserModel.create({ name: SEED_USER.name })
    await PartnerModel.create({ name: SEED_PARTNER.name })
    const userObj = await UserModel.find().lean()
    const partnerObj = await PartnerModel.find().lean()
    const categoryObj = await CategoryModel.find().lean()

    await RecordList.forEach((data, index) => {
      data.categoryId = categoryObj[index]._id
        data.userId = userObj[0]._id
      if (!data.isPaidAlone) {
          data.partnerId = partnerObj[0]._id
      }
    })
    console.log(RecordList)
    RecordList.forEach(data => {
      RecordModel.create({
        nameOfCost: data.nameOfCost,
        date: data.date,
        amount: data.amount,
        merchant: data.merchant,
        isPaidAlone: data.isPaidAlone,
        categoryId: data.categoryId,
        userId: data.userId,
        partnerId: data.partnerId,
      })
    })
    console.log('recordSeeder done!')

  } catch (err) {
    console.error(err);
  }
  
})