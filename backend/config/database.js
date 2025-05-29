const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lycee_talmest_rdv',
    charset: 'utf8mb4',
    timezone: '+01:00', // Fuseau horaire Maroc
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Création du pool de connexions
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
});

// Test de connexion
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à MySQL réussie');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion MySQL:', error.message);
        return false;
    }
}

// Fonction utilitaire pour exécuter des requêtes
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la requête:', error.message);
        console.error('Requête:', query);
        console.error('Paramètres:', params);
        throw error;
    }
}

// Fonction pour obtenir une connexion du pool
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Erreur lors de l\'obtention d\'une connexion:', error.message);
        throw error;
    }
}

// Fonction pour formater les dates pour MySQL
function formatDateForMySQL(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Fonction pour formater les dates depuis MySQL
function formatDateFromMySQL(mysqlDate) {
    if (!mysqlDate) return null;
    return new Date(mysqlDate);
}

// Fermeture propre du pool
process.on('SIGINT', async () => {
    console.log('Fermeture du pool de connexions MySQL...');
    await pool.end();
    process.exit(0);
});

module.exports = {
    pool,
    executeQuery,
    getConnection,
    testConnection,
    formatDateForMySQL,
    formatDateFromMySQL
};