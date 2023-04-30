const Router = require('express')
const router = new Router()
const State = require('../models/models.js');
const ApiError = require('../error/ApiError');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path')

router.post('/', upload.single('file'), async (req, res, next) => {
    const { name, email, text } = req.body;
    const file = req.file ? req.file.filename : null;
    try {
        const state = await State.create({name, email, text, file});
        return res.json(state)
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }
})




module.exports = router