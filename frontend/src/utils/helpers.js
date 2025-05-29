import { 
  VALIDATION_PATTERNS, 
  CHARACTER_LIMITS, 
  STATUS_LABELS, 
  MONTH_NAMES_AR, 
  DAY_NAMES_AR,
  ERROR_MESSAGES 
} from './constants';

// Utilitaires de validation
export const validation = {
  // Valider un numéro de téléphone marocain
  validatePhoneNumber: (phone) => {
    if (!phone) return { isValid: false, message: 'رقم الهاتف مطلوب' };
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (!VALIDATION_PATTERNS.PHONE_MOROCCO.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: 'رقم الهاتف غير صحيح. استخدم تنسيق: 06XXXXXXXX أو +212XXXXXXXXX' 
      };
    }
    
    return { isValid: true, message: '' };
  },

  // Valider email
  validateEmail: (email) => {
    if (!email) return { isValid: false, message: 'البريد الإلكتروني مطلوب' };
    
    if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
      return { isValid: false, message: 'البريد الإلكتروني غير صحيح' };
    }
    
    return { isValid: true, message: '' };
  },

  // Valider nom/prénom
  validateName: (name, fieldName = 'الاسم') => {
    if (!name) return { isValid: false, message: `${fieldName} مطلوب` };
    
    const trimmedName = name.trim();
    if (trimmedName.length < CHARACTER_LIMITS.NAME.min) {
      return { 
        isValid: false, 
        message: `${fieldName} يجب أن يكون ${CHARACTER_LIMITS.NAME.min} أحرف على الأقل` 
      };
    }
    
    if (trimmedName.length > CHARACTER_LIMITS.NAME.max) {
      return { 
        isValid: false, 
        message: `${fieldName} يجب أن يكون ${CHARACTER_LIMITS.NAME.max} حرف كحد أقصى` 
      };
    }
    
    return { isValid: true, message: '' };
  },

  // Valider adresse
  validateAddress: (address) => {
    if (!address) return { isValid: false, message: 'العنوان مطلوب' };
    
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < CHARACTER_LIMITS.ADDRESS.min) {
      return { 
        isValid: false, 
        message: `العنوان يجب أن يكون ${CHARACTER_LIMITS.ADDRESS.min} أحرف على الأقل` 
      };
    }
    
    if (trimmedAddress.length > CHARACTER_LIMITS.ADDRESS.max) {
      return { 
        isValid: false, 
        message: `العنوان يجب أن يكون ${CHARACTER_LIMITS.ADDRESS.max} حرف كحد أقصى` 
      };
    }
    
    return { isValid: true, message: '' };
  },

  // Valider date
  validateDate: (date) => {
    if (!date) return { isValid: false, message: 'التاريخ مطلوب' };
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { isValid: false, message: 'لا يمكن اختيار تاريخ في الماضي' };
    }
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    
    if (selectedDate > maxDate) {
      return { isValid: false, message: 'لا يمكن حجز موعد أكثر من 30 يوماً مقدماً' };
    }
    
    return { isValid: true, message: '' };
  },

  // Valider formulaire complet de rendez-vous
  validateAppointmentForm: (formData) => {
    const errors = {};
    
    // Valider nom
    const nomValidation = validation.validateName(formData.nom, 'الاسم العائلي');
    if (!nomValidation.isValid) errors.nom = nomValidation.message;
    
    // Valider prénom
    const prenomValidation = validation.validateName(formData.prenom, 'الاسم الشخصي');
    if (!prenomValidation.isValid) errors.prenom = prenomValidation.message;
    
    // Valider sexe
    if (!formData.sexe) errors.sexe = 'الجنس مطلوب';
    
    // Valider adresse
    const addressValidation = validation.validateAddress(formData.adresse);
    if (!addressValidation.isValid) errors.adresse = addressValidation.message;
    
    // Valider téléphone
    const phoneValidation = validation.validatePhoneNumber(formData.telephone);
    if (!phoneValidation.isValid) errors.telephone = phoneValidation.message;
    
    // Valider niveau scolaire
    if (!formData.niveau_scolaire) errors.niveau_scolaire = 'المستوى الدراسي مطلوب';
    
    // Valider date
    if (!formData.date_rdv) errors.date_rdv = 'تاريخ الموعد مطلوب';
    
    // Valider heure
    if (!formData.heure_rdv) errors.heure_rdv = 'وقت الموعد مطلوب';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Utilitaires de formatage des dates
export const dateHelpers = {
  // Formater date pour affichage (DD/MM/YYYY)
  formatDate: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Formater heure pour affichage (HH:MM)
  formatTime: (time) => {
    if (!time) return '';
    
    // Si c'est déjà au format HH:MM
    if (typeof time === 'string' && time.includes(':')) {
      return time.substring(0, 5);
    }
    
    const d = new Date(`1970-01-01T${time}`);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  // Formater date complète en arabe
  formatDateArabic: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const dayName = DAY_NAMES_AR[d.getDay()];
    const day = d.getDate();
    const monthName = MONTH_NAMES_AR[d.getMonth()];
    const year = d.getFullYear();
    
    return `${dayName} ${day} ${monthName} ${year}`;
  },

  // Obtenir nom du jour en arabe
  getDayNameArabic: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return DAY_NAMES_AR[d.getDay()];
  },

  // Vérifier si une date est aujourd'hui
  isToday: (date) => {
    if (!date) return false;
    
    const d = new Date(date);
    const today = new Date();
    
    return d.toDateString() === today.toDateString();
  },

  // Vérifier si une date est demain
  isTomorrow: (date) => {
    if (!date) return false;
    
    const d = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return d.toDateString() === tomorrow.toDateString();
  },

  // Calculer la différence en jours
  getDaysDifference: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
};

// Utilitaires de gestion des erreurs
export const errorHelpers = {
  // Extraire message d'erreur depuis la réponse API
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return ERROR_MESSAGES.NETWORK_ERROR;
  },

  // Mapper codes d'erreur HTTP vers messages en arabe
  mapHttpErrorToMessage: (statusCode) => {
    const errorMap = {
      400: 'بيانات غير صحيحة',
      401: 'غير مصرح بالوصول',
      403: 'ممنوع الوصول',
      404: 'العنصر غير موجود',
      409: 'تعارض في البيانات',
      422: 'بيانات غير صالحة',
      500: 'خطأ في الخادم',
      502: 'خطأ في الاتصال',
      503: 'الخدمة غير متوفرة'
    };
    
    return errorMap[statusCode] || ERROR_MESSAGES.NETWORK_ERROR;
  }
};

// Utilitaires de formatage du texte
export const textHelpers = {
  // Tronquer texte avec points de suspension
  truncate: (text, maxLength = 50) => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  },

  // Capitaliser première lettre
  capitalize: (text) => {
    if (!text) return '';
    
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Nettoyer numéro de téléphone
  cleanPhoneNumber: (phone) => {
    if (!phone) return '';
    
    return phone.replace(/\s/g, '');
  },

  // Formater numéro de téléphone pour affichage
  formatPhoneNumber: (phone) => {
    if (!phone) return '';
    
    const cleaned = textHelpers.cleanPhoneNumber(phone);
    
    // Format pour numéros marocains
    if (cleaned.startsWith('+212')) {
      const number = cleaned.substring(4);
      return `+212 ${number.substring(0, 1)} ${number.substring(1, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7)}`;
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`;
    }
    
    return phone;
  }
};

// Utilitaires de gestion des status
export const statusHelpers = {
  // Obtenir label du status en arabe
  getStatusLabel: (status) => {
    return STATUS_LABELS[status] || status;
  },

  // Obtenir classe CSS pour le status
  getStatusClass: (status) => {
    const statusClasses = {
      'confirmé': 'success',
      'en_attente': 'warning',
      'annulé': 'danger'
    };
    
    return statusClasses[status] || 'secondary';
  },

  // Vérifier si un status est actif
  isActiveStatus: (status) => {
    return status === 'confirmé' || status === 'en_attente';
  }
};

// Utilitaires de stockage local
export const storageHelpers = {
  // Sauvegarder données dans localStorage
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur sauvegarde localStorage:', error);
    }
  },

  // Récupérer données depuis localStorage
  getFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Erreur lecture localStorage:', error);
      return defaultValue;
    }
  },

  // Supprimer élément du localStorage
  removeFromStorage: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Erreur suppression localStorage:', error);
    }
  },

  // Vider tout le localStorage
  clearStorage: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Erreur vidage localStorage:', error);
    }
  }
};

// Utilitaires de génération PDF
export const pdfHelpers = {
  // Générer nom de fichier unique
  generateFileName: (prefix = 'document', extension = 'pdf') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
  },

  // Formater données pour PDF
  formatDataForPDF: (appointment) => {
    return {
      ...appointment,
      date_formatted: dateHelpers.formatDate(appointment.date_rdv),
      heure_formatted: dateHelpers.formatTime(appointment.heure_rdv),
      telephone_formatted: textHelpers.formatPhoneNumber(appointment.telephone),
      status_label: statusHelpers.getStatusLabel(appointment.statut),
      nom_complet: `${appointment.prenom} ${appointment.nom}`
    };
  }
};

// Utilitaires de debounce et throttle
export const performanceHelpers = {
  // Debounce fonction
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle fonction  
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Utilitaires de copie dans le presse-papiers
export const clipboardHelpers = {
  // Copier texte dans le presse-papiers
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback pour anciens navigateurs
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  }
};

// Export de toutes les utilities
export default {
  validation,
  dateHelpers,
  errorHelpers,
  textHelpers,
  statusHelpers,
  storageHelpers,
  pdfHelpers,
  performanceHelpers,
  clipboardHelpers
};