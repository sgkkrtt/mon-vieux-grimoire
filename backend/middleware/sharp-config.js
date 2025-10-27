const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const filename = `${Date.now()}-${req.file.originalname.split(' ').join('_')}.webp`;
    const outputPath = path.join('images', filename);

    // Crée le dossier "images" s’il n’existe pas
    if (!fs.existsSync('images')) fs.mkdirSync('images');

    await sharp(req.file.buffer)
      .resize({ width: 800 }) // limite la largeur à 800px
      .toFormat('webp', { quality: 80 })
      .toFile(outputPath);

    req.file.filename = filename;
    req.body.imageUrl = `${req.protocol}://${req.get('host')}/images/${filename}`;

    next();
  } catch (err) {
    console.error('Erreur Sharp :', err);
    res.status(500).json({ error: 'Erreur lors du traitement de l’image' });
  }
};
