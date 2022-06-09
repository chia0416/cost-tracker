const express = require('express')
const router = express.Router()
const costController = require('../controllers/costControllers')

router.get('/', costController.getLists)

module.exports = router