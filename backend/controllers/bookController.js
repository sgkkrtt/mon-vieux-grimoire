const Book = require('../models/Book');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    await book.save();
    res.status(201).json({ message: 'Livre créé avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    await Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id });
    res.status(200).json({ message: 'Livre mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
