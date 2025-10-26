const Book = require('../models/Book');

// GET all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET one book by id
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST create a book
exports.createBook = async (req, res) => {
  try {
    const book = new Book({ ...req.body });
    await book.save();
    res.status(201).json({ message: 'Livre créé avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update a book
exports.updateBook = async (req, res) => {
  try {
    await Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id });
    res.status(200).json({ message: 'Livre mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a book
exports.deleteBook = async (req, res) => {
  try {
    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
