const express = require('express')
const router = express.Router()
const costController = require('../controllers/costControllers')

router.get('/', costController.getRecordByList)
router.get('/record/new', costController.getRecordCreate)

module.exports = router