const Category = require('../category')
const db = require('../../config/mongoose')

db.once('open', () => {
  Category.create(
    {
      name: '固定費',
      icon: '<i class="fa-duotone fa-house-building"></i>'
    },
    {
      name: '交通費',
      icon: '<i class="fa-duotone fa-taxi-bus"></i>'
    },
    {
      name: '娯楽交際費',
      icon: '<i class="fa-duotone fa-party-horn"></i>'
    },
    {
      name: '食事と消耗品（家で）',
      icon: '<i class="fa-duotone fa-kitchen-set"></i>'
    },
    {
      name: '被服費',
      icon: '<i class="fa-duotone fa-cart-minus"></i>'
    },
    {
      name: '特別費',
      icon:'<i class="fa-duotone fa-gem"></i>',
    },
    {
      name: 'その他',
      icon: '<i class="fa-duotone fa-pen-line"></i>'
    }
  ).then(() => {
    console.log('categorySeeder done!')
    return db.close()
  })
})