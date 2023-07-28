const express = require('express')
const router = express.Router()
const detailsController = require('../controllers/detailsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(detailsController.getAllDetails)
    .post(detailsController.createNewDetail)
    .patch(detailsController.updateDetail)
    .delete(detailsController.deleteDetail)

module.exports = router