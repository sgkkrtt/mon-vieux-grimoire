const express = require('express');

const router = express.Router();
const bookCtrl = require('../controllers/bookController');

// Routes CRUD
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', bookCtrl.createBook);
router.put('/:id', bookCtrl.updateBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;
