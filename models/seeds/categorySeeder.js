const Category = require('../category')
const db = require('../../config/mongoose')

db.once('open', () => {
  Category.create(
    {
      name: '固定費',
      icon: '<i class="fa-solid fa-house"></i>'
    },
    {
      name: '交通費',
      icon: '<i class="fa-solid fa-train-subway"></i>'
    },
    {
      name: '娯楽交際費',
      icon: '<i class="fa-solid fa-champagne-glasses"></i>'
    },
    {
      name: '食事と消耗品（家で）',
      icon: '<i class="fa-solid fa-bowl-food"></i>'
    },
    {
      name: '被服費',
      icon: '<i class="fa-solid fa-shirt"></i>'
    },
    {
      name: '特別費',
      icon: '<i class="fa-solid fa-gem"></i>',
    },
    {
      name: 'その他',
      icon: '<i class="fa-solid fa-file-pen"></i>'
    }
  ).then(() => {
    console.log('categorySeeder done!')
    return db.close()
  })
})