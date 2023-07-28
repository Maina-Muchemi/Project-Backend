const Detail = require('../models/Detail')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')



// @route GET /details
const getAllDetails = asyncHandler(async (req, res) => {
    // Get all details from MongoDB
    const details = await Detail.find().lean()

    // If no details 
    if (!details?.length) {
        return res.status(400).json({ message: 'No details found' })
    }

    // Add username to each detail before sending the response 
    const detailsWithUser = await Promise.all(details.map(async (detail) => {
        const user = await User.findById(detail.user).lean().exec()
        return { ...detail, username: user.username }
    }))

    res.json(detailsWithUser)
})

//  Create new detail
const createNewDetail = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Detail.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate detail title' })
    }

    // Create and store the new user 
    const detail = await Detail.create({ user, title, text })

    if (detail) { 
        return res.status(201).json({ message: 'New detail created' })
    } else {
        return res.status(400).json({ message: 'Invalid detail data received' })
    }

})

//update
const updateDetail = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm detail exists to update
    const detail = await Detail.findById(id).exec()

    if (!detail) {
        return res.status(400).json({ message: 'Detail not found' })
    }

    // Check for duplicate title
    const duplicate = await Detail.findOne({ title }).lean().exec()

    // Allow renaming of the original detail 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate detail title' })
    }

    detail.user = user
    detail.title = title
    detail.text = text
    detail.completed = completed

    const updatedDetail = await detail.save()

    res.json(`'${updatedDetail.title}' updated`)
})

//deleting
const deleteDetail = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Detail ID required' })
    }

    // Confirm detail exists to delete 
    const detail = await Detail.findById(id).exec()

    if (!detail) {
        return res.status(400).json({ message: 'Detail not found' })
    }

    const result = await detail.deleteOne()

    const reply = `Detail '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllDetails,
    createNewDetail,
    updateDetail,
    deleteDetail
}