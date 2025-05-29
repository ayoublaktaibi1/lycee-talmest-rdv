import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec configuration de base
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour les requêtes (ajouter token d'auth si nécessaire)
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log des requêtes en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    // Log des réponses en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      // Erreur avec réponse du serveur
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Non autorisé - rediriger vers login ou effacer token
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
          break;
          
        case 403:
          // Accès interdit
          console.error('Accès interdit:', data.message);
          break;
          
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée:', data.message);
          break;
          
        case 409:
          // Conflit (ex: créneau déjà pris)
          console.error('Conflit:', data.message);
          break;
          
        case 422:
          // Erreur de validation
          console.error('Erreur de validation:', data.message);
          break;
          
        case 500:
          // Erreur serveur
          console.error('Erreur serveur:', data.message);
          break;
          
        default:
          console.error(`Erreur ${status}:`, data.message);
      }
      
      // Log de l'erreur complète en développement
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response);
      }
    } else if (error.request) {
      // Erreur réseau ou pas de réponse
      console.error('Erreur réseau:', error.message);
    } else {
      // Autre erreur
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les appels API

// Rendez-vous
export const appointmentAPI = {
  // Récupérer les dates disponibles
  getAvailableDates: () => api.get('/appointments/available-dates'),
  
  // Récupérer les créneaux disponibles pour une date
  getAvailableSlots: (date) => api.get(`/appointments/available-slots/${date}`),
  
  // Créer un nouveau rendez-vous
  create: (appointmentData) => api.post('/appointments', appointmentData),
  
  // Récupérer un rendez-vous par ID
  getById: (id) => api.get(`/appointments/${id}`),
  
  // Vérifier un rendez-vous
  verify: (id) => api.get(`/appointments/verify/${id}`)
};

// Administration
export const adminAPI = {
  // Récupérer tous les rendez-vous avec filtres et pagination
  getAppointments: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/appointments${queryString ? `?${queryString}` : ''}`);
  },
  
  // Mettre à jour un rendez-vous
  updateAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data),
  
  // Supprimer un rendez-vous
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),
  
  // Récupérer les statistiques
  getStatistics: () => api.get('/admin/statistics'),
  
  // Exporter les rendez-vous d'une date
  exportAppointments: (date) => api.get(`/admin/appointments/export/${date}`),
  
  // Récupérer les créneaux horaires
  getTimeSlots: () => api.get('/admin/time-slots'),
  
  // Activer/désactiver un créneau
  toggleTimeSlot: (id) => api.put(`/admin/time-slots/${id}/toggle`)
};

// Gestion des erreurs communes
export const handleAPIError = (error, defaultMessage = 'خطأ غير متوقع') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// Fonction pour vérifier la connectivité avec le serveur
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('خطأ في الاتصال بالخادم');
  }
};

// Fonction pour formater les dates pour l'API
export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return date;
  }
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
};

// Fonction pour formater l'heure pour l'API
export const formatTimeForAPI = (time) => {
  if (!time) return null;
  
  // Si c'est déjà au format HH:mm:ss
  if (typeof time === 'string' && time.includes(':')) {
    return time.length === 5 ? `${time}:00` : time;
  }
  
  return null;
};

// Configuration pour le développement vs production
if (process.env.NODE_ENV === 'development') {
  // En développement, on peut ajouter des logs supplémentaires
  window.api = api; // Disponible dans la console pour debug
}

export default api;