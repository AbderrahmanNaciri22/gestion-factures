const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }
  
  // Erreur de clé dupliquée
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existe déjà`
    });
  }
  
  // Erreur de Cast (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;