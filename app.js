const express = require('express')
const { engine } = require('express-handlebars')

require('./config/mongoose')
const app = express()
const port = 3000

app.engine('handlebars', engine({ defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})