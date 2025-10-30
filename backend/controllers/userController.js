const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      console.error('Erreur signup : Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(req.body.email)) {
      console.error('Erreur signup : Format d’email invalide →', req.body.email);
      return res.status(400).json({ message: 'Format d’email invalide' });
    }

    if (req.body.password.length < 8) {
      console.error('Erreur signup : Mot de passe trop court');
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({ email: req.body.email, password: hash });
    await user.save();

    console.log('Utilisateur créé avec succès :', req.body.email);
    return res.status(201).json({ message: 'Utilisateur créé !' });
  } catch (err) {
    console.error('Erreur signup (catch) :', err.message);
    return res.status(400).json({ message: 'Erreur lors de la création', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.error('Erreur login : utilisateur introuvable →', req.body.email);
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      console.error('Erreur login : mot de passe incorrect pour →', req.body.email);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Connexion réussie :', req.body.email);
    return res.status(200).json({ userId: user.id, token });
  } catch (err) {
    console.error('Erreur login (catch) :', err.message);
    return res.status(500).json({ error: err.message });
  }
};
