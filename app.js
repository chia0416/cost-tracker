// 載入程式
const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')
if (process.env.NODE_ENV !== 'production') {
  // console.log(process.env)
  require('dotenv').config()
}

const routes = require('./routes')
//Mongoose 連線設定只需要「被執行」即可所以不用設定變數
require('./config/mongoose')

//設定變數
const app = express()
const PORT = process.env.PORT || 3000

app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(routes)

app.listen(PORT, () => {
  console.log(`Express is running on http://localhost:${PORT}`)
})