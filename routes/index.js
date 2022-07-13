const express = require('express')
const router = express.Router()
const costController = require('../controllers/costControllers')

router.get('/', costController.getRecordByList)
router.get('/record/new', costController.getRecordCreate)
router.post('/record/new', costController.recordCreated)
router.get('/record/edit/:id', costController.getRecordEdit)
router.put('/record/edit/:id', costController.recordEdited)

module.exports = router