const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { 
  optionalAuth, 
  createRateLimiter, 
  sanitizeInput, 
  logAdminAction, 
  validateId 
} = require('../middleware/auth');

// Middleware de limitation du taux pour les routes admin
const adminRateLimit = createRateLimiter(15 * 60 * 1000, 100); // 100 requêtes par 15 minutes

// Middleware de sanitisation pour toutes les routes
router.use(sanitizeInput);
router.use(adminRateLimit);

// Pour cette version, on utilise optionalAuth (pas d'authentification stricte)
// En production, remplacer par authenticateToken + requireAdmin
router.use(optionalAuth);

// GET /api/admin/appointments
// Récupérer tous les rendez-vous avec pagination et filtres
router.get('/appointments', 
  logAdminAction('VIEW_APPOINTMENTS'), 
  adminController.getAppointments
);

// PUT /api/admin/appointments/:id
// Modifier un rendez-vous
router.put('/appointments/:id', 
  validateId(), 
  logAdminAction('UPDATE_APPOINTMENT'), 
  adminController.updateAppointment
);

// DELETE /api/admin/appointments/:id
// Supprimer un rendez-vous
router.delete('/appointments/:id', 
  validateId(), 
  logAdminAction('DELETE_APPOINTMENT'), 
  adminController.deleteAppointment
);

// GET /api/admin/statistics
// Récupérer les statistiques générales
router.get('/statistics', 
  logAdminAction('VIEW_STATISTICS'), 
  adminController.getStatistics
);

// GET /api/admin/appointments/export/:date
// Exporter les rendez-vous d'une date au format JSON (pour PDF côté client)
router.get('/appointments/export/:date', 
  logAdminAction('EXPORT_APPOINTMENTS'), 
  adminController.exportAppointmentsByDate
);

// GET /api/admin/time-slots
// Récupérer les créneaux horaires
router.get('/time-slots', 
  logAdminAction('VIEW_TIME_SLOTS'), 
  adminController.getTimeSlots
);

// POST /api/admin/time-slots
// Ajouter un nouveau créneau horaire
router.post('/time-slots', 
  logAdminAction('ADD_TIME_SLOT'), 
  adminController.addTimeSlot
);

// PUT /api/admin/time-slots/:id/toggle
// Activer/désactiver un créneau horaire
router.put('/time-slots/:id/toggle', 
  validateId(), 
  logAdminAction('TOGGLE_TIME_SLOT'), 
  adminController.toggleTimeSlot
);

// DELETE /api/admin/time-slots/:id
// Supprimer un créneau horaire
router.delete('/time-slots/:id', 
  validateId(), 
  logAdminAction('DELETE_TIME_SLOT'), 
  adminController.deleteTimeSlot
);

// GET /api/admin/closed-days
// Récupérer les jours fermés
router.get('/closed-days', 
  logAdminAction('VIEW_CLOSED_DAYS'), 
  adminController.getClosedDays
);

// POST /api/admin/closed-days
// Ajouter un jour fermé
router.post('/closed-days', 
  logAdminAction('ADD_CLOSED_DAY'), 
  adminController.addClosedDay
);

// Routes statistiques avancées

// GET /api/admin/reports/monthly/:year/:month
// Rapport mensuel
router.get('/reports/monthly/:year/:month', 
  logAdminAction('VIEW_MONTHLY_REPORT'), 
  async (req, res) => {
    try {
      const { year, month } = req.params;
      
      if (!year || !month || isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          message: 'Année et mois requis (format numérique)'
        });
      }

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

      const appointments = await Appointment.findAll({
        dateFrom: startDate,
        dateTo: endDate
      });

      const statistics = PDFGenerator.calculateStatistics(appointments);
      
      res.json({
        success: true,
        period: {
          year: parseInt(year),
          month: parseInt(month),
          startDate,
          endDate,
          monthName: moment(startDate).format('MMMM YYYY')
        },
        appointments: appointments.map(a => a.toDisplayFormat()),
        statistics
      });

    } catch (error) {
      console.error('Erreur lors du rapport mensuel:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport mensuel'
      });
    }
  }
);

// GET /api/admin/dashboard
// Données du tableau de bord
router.get('/dashboard', 
  logAdminAction('VIEW_DASHBOARD'), 
  async (req, res) => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const thisWeek = moment().startOf('week').format('YYYY-MM-DD');
      const thisMonth = moment().startOf('month').format('YYYY-MM-DD');

      // Rendez-vous d'aujourd'hui
      const todayAppointments = await Appointment.findByDate(today);
      
      // Rendez-vous à venir (7 prochains jours)
      const upcomingAppointments = await Appointment.findUpcoming(7);
      
      // Statistiques générales
      const generalStats = await Appointment.getStatistics();
      
      // Créneaux populaires
      const popularSlots = await Appointment.getPopularSlots(5);

      res.json({
        success: true,
        dashboard: {
          today: {
            date: today,
            appointments: todayAppointments.map(a => a.toDisplayFormat()),
            count: todayAppointments.length
          },
          upcoming: upcomingAppointments.map(a => a.toDisplayFormat()),
          statistics: generalStats,
          popularSlots,
          generated_at: moment().format('DD/MM/YYYY à HH:mm')
        }
      });

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement du tableau de bord'
      });
    }
  }
);

module.exports = router;