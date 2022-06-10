const mongoose = require('mongoose')

// mongoose.connect(process.env.MONGODB_URI)
mongoose.connect("mongodb+srv://chia:cost@cluster0.kq1t3p9.mongodb.net/cost-tracker?retryWrites=true&w=majority")

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

module.exports = db
