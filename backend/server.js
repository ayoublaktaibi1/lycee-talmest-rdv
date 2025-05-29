const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Chargement des variables d'environnement
dotenv.config();

// Import des routes
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes principales
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Serveur du Lycée Talmest fonctionnel',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// Route par défaut
app.get('/', (req, res) => {
    res.json({
        message: 'API du système de rendez-vous - Lycée Qualifiant Talmest',
        version: '1.0.0',
        endpoints: {
            appointments: '/api/appointments',
            admin: '/api/admin',
            health: '/api/health'
        }
    });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);
    res.status(500).json({
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🏫 Système de rendez-vous - Lycée Qualifiant Talmest`);
    
    // Test de connexion à la base de données au démarrage
    const db = require('./config/database');
    db.getConnection()
        .then(() => {
            console.log('✅ Connexion à la base de données réussie');
        })
        .catch(err => {
            console.error('❌ Erreur de connexion à la base de données:', err.message);
        });
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur (Ctrl+C)...');
    process.exit(0);
});

module.exports = app;