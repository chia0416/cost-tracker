const express = require('express')
const app = express()
const port = 3000

// console.log(app.listen(port))

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})