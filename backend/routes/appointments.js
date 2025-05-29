const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { createRateLimiter, validateAppointmentData, sanitizeInput, validateId } = require('../middleware/auth');

// Middleware de limitation du taux pour les créations de rendez-vous
const appointmentRateLimit = createRateLimiter(15 * 60 * 1000, 5); // 5 rendez-vous par 15 minutes par IP

// Middleware de sanitisation pour toutes les routes
router.use(sanitizeInput);

// GET /api/appointments/available-dates
// Récupérer les dates disponibles pour les prochains 30 jours
router.get('/available-dates', appointmentController.getAvailableDates);

// GET /api/appointments/available-slots/:date
// Récupérer les créneaux disponibles pour une date donnée
router.get('/available-slots/:date', appointmentController.getAvailableSlots);

// POST /api/appointments
// Créer un nouveau rendez-vous
router.post('/', appointmentRateLimit, validateAppointmentData, appointmentController.createAppointment);

// GET /api/appointments/:id
// Récupérer un rendez-vous par son ID
router.get('/:id', validateId(), appointmentController.getAppointmentById);

// GET /api/appointments/verify/:id
// Vérifier et récupérer les détails d'un rendez-vous pour confirmation
router.get('/verify/:id', validateId(), appointmentController.verifyAppointment);

// PUT /api/appointments/:id/cancel
// Annuler un rendez-vous (optionnel pour les utilisateurs)
router.put('/:id/cancel', validateId(), appointmentController.cancelAppointment);

module.exports = router;