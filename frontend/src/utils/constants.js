// Constantes pour l'application frontend

// Configuration API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Informations de l'école
export const SCHOOL_INFO = {
  NAME_AR: process.env.REACT_APP_SCHOOL_NAME || 'الثانوية التأهيلية تالمست',
  NAME_FR: process.env.REACT_APP_SCHOOL_NAME_FR || 'Lycée Qualifiant Talmest',
  ADDRESS: process.env.REACT_APP_SCHOOL_ADDRESS || 'تالمست، المغرب',
  PHONE: process.env.REACT_APP_SCHOOL_PHONE || '+212 5XX XX XX XX',
  EMAIL: process.env.REACT_APP_SCHOOL_EMAIL || 'contact@lycee-talmest.ma',
  WEBSITE: process.env.REACT_APP_SCHOOL_WEBSITE || 'https://lycee-talmest.ma'
};

// Status des rendez-vous
export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmé',
  PENDING: 'en_attente',
  CANCELLED: 'annulé'
};

// Labels des status en arabe
export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.CONFIRMED]: 'مؤكد',
  [APPOINTMENT_STATUS.PENDING]: 'في الانتظار',
  [APPOINTMENT_STATUS.CANCELLED]: 'ملغى'
};

// Couleurs des status
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.CONFIRMED]: {
    bg: 'success',
    color: '#10b981',
    bgLight: '#dcfce7'
  },
  [APPOINTMENT_STATUS.PENDING]: {
    bg: 'warning',
    color: '#f59e0b',
    bgLight: '#fef3c7'
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    bg: 'danger',
    color: '#ef4444',
    bgLight: '#fee2e2'
  }
};

// Niveaux scolaires disponibles
export const SCHOOL_LEVELS = [
  'الجذع المشترك العلمي',
  'الجذع المشترك الأدبي',
  'الجذع المشترك التكنولوجي',
  'السنة الأولى باكالوريا علوم رياضية',
  'السنة الأولى باكالوريا علوم تجريبية',
  'السنة الأولى باكالوريا علوم فيزيائية',
  'السنة الأولى باكالوريا آداب وعلوم إنسانية',
  'السنة الأولى باكالوريا علوم اقتصادية وتدبيرية',
  'السنة الثانية باكالوريا علوم رياضية',
  'السنة الثانية باكالوريا علوم فيزيائية',
  'السنة الثانية باكالوريا علوم الحياة والأرض',
  'السنة الثانية باكالوريا آداب وعلوم إنسانية',
  'السنة الثانية باكالوريا علوم اقتصادية وتدبيرية'
];

// Options de sexe
export const GENDER_OPTIONS = [
  { value: 'ذكر', label: 'ذكر' },
  { value: 'أنثى', label: 'أنثى' }
];

// Horaires de travail
export const WORKING_HOURS = {
  MORNING: {
    START: '08:00',
    END: '12:00'
  },
  AFTERNOON: {
    START: '14:00',
    END: '17:00'
  },
  CLOSED_DAYS: [5, 6], // Vendredi et Samedi (0 = Dimanche)
  SLOT_DURATION: 30 // minutes
};

// Messages d'erreur en arabe
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى',
  SERVER_ERROR: 'خطأ في الخادم. يرجى المحاولة لاحقاً',
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  SLOT_TAKEN: 'هذا الموعد غير متاح. يرجى اختيار موعد آخر',
  REQUIRED_FIELDS: 'يرجى ملء جميع الحقول المطلوبة',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  INVALID_DATE: 'تاريخ غير صحيح',
  PAST_DATE: 'لا يمكن حجز موعد في الماضي'
};

// Messages النجاح
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'تم حجز الموعد بنجاح',
  APPOINTMENT_UPDATED: 'تم تحديث الموعد بنجاح',
  APPOINTMENT_CANCELLED: 'تم إلغاء الموعد بنجاح',
  APPOINTMENT_DELETED: 'تم حذف الموعد بنجاح',
  DATA_SAVED: 'تم حفظ البيانات بنجاح',
  PDF_GENERATED: 'تم إنشاء ملف PDF بنجاح',
  DATA_EXPORTED: 'تم تصدير البيانات بنجاح'
};

// Configuration de pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_VISIBLE_PAGES: 5
};

// Configuration des filtres
export const FILTER_OPTIONS = {
  STATUS: [
    { value: '', label: 'جميع الحالات' },
    { value: APPOINTMENT_STATUS.CONFIRMED, label: STATUS_LABELS[APPOINTMENT_STATUS.CONFIRMED] },
    { value: APPOINTMENT_STATUS.PENDING, label: STATUS_LABELS[APPOINTMENT_STATUS.PENDING] },
    { value: APPOINTMENT_STATUS.CANCELLED, label: STATUS_LABELS[APPOINTMENT_STATUS.CANCELLED] }
  ],
  DATE_RANGES: [
    { value: 'today', label: 'اليوم' },
    { value: 'tomorrow', label: 'غداً' },
    { value: 'this_week', label: 'هذا الأسبوع' },
    { value: 'next_week', label: 'الأسبوع القادم' },
    { value: 'this_month', label: 'هذا الشهر' },
    { value: 'custom', label: 'تاريخ مخصص' }
  ]
};

// Configuration des notifications toast
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-center',
  SUCCESS: {
    style: {
      background: '#10b981',
      color: '#fff',
      fontFamily: 'Noto Sans Arabic, Arial, sans-serif'
    }
  },
  ERROR: {
    style: {
      background: '#ef4444',
      color: '#fff',
      fontFamily: 'Noto Sans Arabic, Arial, sans-serif'
    }
  },
  WARNING: {
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontFamily: 'Noto Sans Arabic, Arial, sans-serif'
    }
  }
};

// Regex de validation
export const VALIDATION_PATTERNS = {
  PHONE_MOROCCO: /^(\+212|0)[5-7][0-9]{8}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}(:\d{2})?$/
};

// Limites de caractères
export const CHARACTER_LIMITS = {
  NAME: { min: 2, max: 50 },
  ADDRESS: { min: 10, max: 200 },
  PHONE: { min: 10, max: 15 },
  NOTES: { max: 500 }
};

// Configuration des dates
export const DATE_CONFIG = {
  LOCALE: 'ar',
  FORMAT: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATETIME: 'DD/MM/YYYY à HH:mm'
  },
  MAX_BOOKING_DAYS: 30, // Nombre maximum de jours à l'avance pour réserver
  MIN_BOOKING_HOURS: 2   // Nombre minimum d'heures à l'avance pour réserver
};

// Noms des mois en arabe
export const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Noms des jours en arabe
export const DAY_NAMES_AR = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

// Noms des jours courts en arabe
export const DAY_NAMES_SHORT_AR = [
  'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'
];

// Configuration des icônes
export const ICONS = {
  CALENDAR: 'calendar',
  CLOCK: 'clock',
  USER: 'user',
  PHONE: 'phone',
  EMAIL: 'mail',
  LOCATION: 'map-pin',
  EDIT: 'edit',
  DELETE: 'trash-2',
  DOWNLOAD: 'download',
  PRINT: 'printer',
  REFRESH: 'refresh-cw',
  SEARCH: 'search',
  FILTER: 'filter',
  EXPORT: 'download',
  STATS: 'bar-chart-3'
};

// Configuration des couleurs du thème
export const THEME_COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  LIGHT: '#f8fafc',
  DARK: '#1f2937'
};

// URLs des pages
export const ROUTES = {
  HOME: '/',
  APPOINTMENT: '/appointment',
  CONFIRMATION: '/confirmation',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login'
};

// Configuration du stockage local
export const STORAGE_KEYS = {
  THEME: 'lycee_talmest_theme',
  LANGUAGE: 'lycee_talmest_language',
  ADMIN_TOKEN: 'lycee_talmest_admin_token',
  FORM_DRAFT: 'lycee_talmest_form_draft'
};

// Configuration de l'export PDF
export const PDF_CONFIG = {
  MARGINS: {
    TOP: 20,
    RIGHT: 20,
    BOTTOM: 20,
    LEFT: 20
  },
  FONT_SIZE: {
    TITLE: 18,
    HEADING: 14,
    BODY: 12,
    SMALL: 10
  },
  COLORS: {
    PRIMARY: '#2563eb',
    TEXT: '#1f2937',
    GRAY: '#6b7280',
    LIGHT_GRAY: '#f3f4f6'
  }
};

// Configuration du mode développement
export const DEV_CONFIG = {
  ENABLE_LOGS: process.env.NODE_ENV === 'development',
  MOCK_DATA: process.env.REACT_APP_MOCK_DATA === 'true',
  API_DELAY: parseInt(process.env.REACT_APP_API_DELAY) || 0
};

// Messages de chargement
export const LOADING_MESSAGES = {
  FETCHING_DATES: 'جاري تحميل التواريخ المتاحة...',
  FETCHING_SLOTS: 'جاري تحميل الأوقات المتاحة...',
  CREATING_APPOINTMENT: 'جاري حجز الموعد...',
  UPDATING_APPOINTMENT: 'جاري تحديث الموعد...',
  DELETING_APPOINTMENT: 'جاري حذف الموعد...',
  LOADING_STATISTICS: 'جاري تحميل الإحصائيات...',
  GENERATING_PDF: 'جاري إنشاء ملف PDF...',
  EXPORTING_DATA: 'جاري تصدير البيانات...'
};

// Configuration des animations
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: 'ease-in-out'
};

export default {
  API_CONFIG,
  SCHOOL_INFO,
  APPOINTMENT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  SCHOOL_LEVELS,
  GENDER_OPTIONS,
  WORKING_HOURS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION_CONFIG,
  FILTER_OPTIONS,
  TOAST_CONFIG,
  VALIDATION_PATTERNS,
  CHARACTER_LIMITS,
  DATE_CONFIG,
  MONTH_NAMES_AR,
  DAY_NAMES_AR,
  DAY_NAMES_SHORT_AR,
  ICONS,
  THEME_COLORS,
  ROUTES,
  STORAGE_KEYS,
  PDF_CONFIG,
  DEV_CONFIG,
  LOADING_MESSAGES,
  ANIMATION_CONFIG
};