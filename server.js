
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Connecter à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/admin', require('./routes/admin'));

// Route Dashboard
const { getDashboard } = require('./controllers/dashboardController');
const { protect } = require('./middleware/auth');
app.get('/api/dashboard', protect, getDashboard);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API Gestion des Factures Fournisseurs',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      suppliers: '/api/suppliers',
      invoices: '/api/invoices',
      admin: '/api/admin',
      dashboard: '/api/dashboard'
    }
  });
});

// Gestionnaire d'erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});