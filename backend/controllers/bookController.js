const Book = require('../models/Book')

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
  } catch (err) {
    console.error('Erreur getAllBooks →', err)
    res.status(400).json({ error: err.message })
  }
}

exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Livre introuvable' })
    res.status(200).json(book)
  } catch (err) {
    console.error('Erreur getOneBook →', err)
    res.status(400).json({ error: err.message })
  }
}

exports.createBook = async (req, res) => {
  try {
    const payload = typeof req.body.book === 'string' ? JSON.parse(req.body.book) : req.body
    const { title, author, year, genre } = payload
    if (!title || !author || !year || !genre) {
      console.error('Erreur createBook → champ(s) vide(s)', { title, author, year, genre })
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' })
    }
    if (!req.file) {
      console.error('Erreur createBook → image manquante')
      return res.status(400).json({ error: 'Image requise.' })
    }

    const grade = Number(payload.rating ?? req.body.rating)
    if (Number.isNaN(grade) || grade < 0 || grade > 5) {
      console.error('Erreur createBook → note invalide', grade)
      return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' })
    }

    delete payload._id
    delete payload._userId

    const book = new Book({
      ...payload,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: [{ userId: req.auth.userId, grade }],
      averageRating: Math.round(grade * 100) / 100
    })

    await book.save()
    console.log('Livre créé avec succès →', book.title)
    return res.status(201).json({ message: 'Livre créé avec succès' })
  } catch (err) {
    console.error('Erreur createBook (catch) →', err)
    return res.status(400).json({ error: err.message })
  }
}


exports.updateBook = async (req, res) => {
  try {
    const { title, author, year, genre } = req.body
    if (!title || !author || !year || !genre) {
      console.error('Erreur updateBook → champ(s) vide(s)')
      return res.status(400).json({ error: 'Aucune section ne peut être vide.' })
    }
    await Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    console.log('Livre mis à jour →', req.params.id)
    res.status(200).json({ message: 'Livre mis à jour' })
  } catch (err) {
    console.error('Erreur updateBook →', err)
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Identifiant du livre invalide.' })
    }
    res.status(400).json({ error: err.message })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    await Book.deleteOne({ _id: req.params.id })
    console.log('Livre supprimé →', req.params.id)
    res.status(200).json({ message: 'Livre supprimé' })
  } catch (err) {
    console.error('Erreur deleteBook →', err)
    res.status(400).json({ error: err.message })
  }
}

exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body
    const userId = req.auth.userId
    const book = await Book.findById(req.params.id)
    if (!book) {
      console.error('Erreur rateBook → livre introuvable', req.params.id)
      return res.status(404).json({ message: 'Livre introuvable' })
    }
    if (rating < 0 || rating > 5) {
      console.error('Erreur rateBook → note invalide', rating)
      return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' })
    }
    const existingRating = book.ratings.find(r => r.userId === userId)
    if (existingRating) {
      console.error('Erreur rateBook → déjà noté', userId)
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' })
    }
    book.ratings.push({ userId, grade: rating })
    const total = book.ratings.reduce((acc, r) => acc + r.grade, 0)
    book.averageRating = Math.round((total / book.ratings.length) * 100) / 100
    await book.save()
    console.log('Note ajoutée →', { userId, rating, moyenne: book.averageRating })
    res.status(200).json(book)
  } catch (err) {
    console.error('Erreur rateBook (catch) →', err)
    res.status(400).json({ error: err.message })
  }
}

exports.getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)
    console.log('Récupération top 3 livres notés')
    res.status(200).json(books)
  } catch (err) {
    console.error('Erreur getBestRatedBooks →', err)
    res.status(400).json({ error: err.message })
  }
}
