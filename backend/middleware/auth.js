const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware d'authentification JWT (optionnel pour l'admin)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }
    
    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe encore et est actif
    const userQuery = 'SELECT id, username, nom, actif FROM admin_users WHERE id = ? AND actif = TRUE';
    const users = await executeQuery(userQuery, [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif'
      });
    }
    
    // Ajouter les infos utilisateur à la requête
    req.user = users[0];
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

// Middleware optionnel - permet l'accès sans token (pour les routes publiques avec fonctionnalités admin optionnelles)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userQuery = 'SELECT id, username, nom, actif FROM admin_users WHERE id = ? AND actif = TRUE';
    const users = await executeQuery(userQuery, [decoded.userId]);
    
    req.user = users.length > 0 ? users[0] : null;
    next();
    
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    req.user = null;
    next();
  }
};

// Middleware de validation des permissions admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification administrateur requise'
    });
  }
  
  next();
};

// Middleware de limitation du taux de requêtes (rate limiting)
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Nettoyer les anciennes entrées
    for (const [key, data] of requests.entries()) {
      if (data.timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Vérifier les requêtes actuelles pour cette IP
    const ipRequests = Array.from(requests.values())
      .filter(data => data.ip === ip && data.timestamp >= windowStart);
    
    if (ipRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Enregistrer cette requête
    requests.set(`${ip}_${now}`, {
      ip,
      timestamp: now
    });
    
    next();
  };
};

// Middleware de validation des données d'entrée
const validateAppointmentData = (req, res, next) => {
  const {
    nom,
    prenom,
    sexe,
    adresse,
    telephone,
    niveau_scolaire,
    date_rdv,
    heure_rdv
  } = req.body;
  
  const errors = [];
  
  // Validation des champs obligatoires
  if (!nom || nom.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!prenom || prenom.trim().length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }
  
  if (!sexe || !['ذكر', 'أنثى'].includes(sexe)) {
    errors.push('Le sexe doit être "ذكر" ou "أنثى"');
  }
  
  if (!adresse || adresse.trim().length < 10) {
    errors.push('L\'adresse doit contenir au moins 10 caractères');
  }
  
  if (!telephone) {
    errors.push('Le numéro de téléphone est requis');
  } else {
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      errors.push('Format de numéro de téléphone marocain invalide');
    }
  }
  
  if (!niveau_scolaire) {
    errors.push('Le niveau scolaire est requis');
  }
  
  if (!date_rdv) {
    errors.push('La date du rendez-vous est requise');
  }
  
  if (!heure_rdv) {
    errors.push('L\'heure du rendez-vous est requise');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors
    });
  }
  
  next();
};

// Middleware de sanitisation des données
const sanitizeInput = (req, res, next) => {
  // Fonction pour nettoyer une chaîne
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer les scripts
      .replace(/[<>]/g, ''); // Supprimer les balises HTML basiques
  };
  
  // Sanitiser récursivement les objets
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  // Sanitiser le body de la requête
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitiser les paramètres de requête
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Middleware de logging des actions admin
const logAdminAction = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Logger l'action si elle a réussi
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const logEntry = {
          userId: req.user.id,
          username: req.user.username,
          action,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          success: true
        };
        
        // En production, on pourrait sauver ceci dans une table de logs
        console.log('Admin Action:', JSON.stringify(logEntry, null, 2));
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware de validation des paramètres d'ID
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: `ID ${paramName} invalide`
      });
    }
    
    req.params[paramName] = parseInt(id);
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  createRateLimiter,
  validateAppointmentData,
  sanitizeInput,
  logAdminAction,
  validateId
};