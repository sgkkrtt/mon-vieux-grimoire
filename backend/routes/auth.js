const express = require('express');

const router = express.Router();
const bookCtrl = require('../controllers/bookController');
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.put('/:id', auth, multer, sharp, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;
