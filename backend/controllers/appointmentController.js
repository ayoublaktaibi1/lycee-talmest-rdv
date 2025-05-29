const { executeQuery } = require('../config/database');
const moment = require('moment');

// Contrôleur pour la gestion des rendez-vous côté utilisateur
class AppointmentController {
  
  // Récupérer les dates disponibles
  async getAvailableDates(req, res) {
    try {
      const today = moment().format('YYYY-MM-DD');
      const endDate = moment().add(30, 'days').format('YYYY-MM-DD');
      
      // Récupérer les jours fermés
      const closedDaysQuery = `
        SELECT date_fermeture 
        FROM closed_days 
        WHERE date_fermeture BETWEEN ? AND ?
      `;
      const closedDays = await executeQuery(closedDaysQuery, [today, endDate]);
      const closedDatesSet = new Set(closedDays.map(day => day.date_fermeture.toISOString().split('T')[0]));
      
      // Générer les dates disponibles (exclure weekends et jours fermés)
      const availableDates = [];
      let currentDate = moment();
      
      for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        const dayOfWeek = currentDate.day(); // 0 = dimanche, 6 = samedi
        
        // Exclure weekends (vendredi=5, samedi=6) et jours fermés
        if (dayOfWeek !== 5 && dayOfWeek !== 6 && !closedDatesSet.has(dateStr)) {
          availableDates.push({
            date: dateStr,
            dayName: currentDate.format('dddd'),
            formatted: currentDate.format('DD/MM/YYYY')
          });
        }
        
        currentDate.add(1, 'day');
      }
      
      res.json({
        success: true,
        dates: availableDates
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des dates disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des dates disponibles'
      });
    }
  }

  // Récupérer les créneaux disponibles pour une date
  async getAvailableSlots(req, res) {
    try {
      const { date } = req.params;
      
      // Valider le format de la date
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide'
        });
      }
      
      // Récupérer tous les créneaux actifs
      const allSlotsQuery = `
        SELECT id, heure_debut, heure_fin 
        FROM time_slots 
        WHERE actif = TRUE 
        ORDER BY heure_debut
      `;
      const allSlots = await executeQuery(allSlotsQuery);
      
      // Récupérer les créneaux déjà réservés pour cette date
      const bookedSlotsQuery = `
        SELECT heure_rdv 
        FROM appointments 
        WHERE date_rdv = ? AND statut IN ('confirmé', 'en_attente')
      `;
      const bookedSlots = await executeQuery(bookedSlotsQuery, [date]);
      const bookedTimesSet = new Set(bookedSlots.map(slot => slot.heure_rdv));
      
      // Filtrer les créneaux disponibles
      const availableSlots = allSlots.filter(slot => {
        return !bookedTimesSet.has(slot.heure_debut);
      }).map(slot => ({
        id: slot.id,
        time: slot.heure_debut,
        timeEnd: slot.heure_fin,
        formatted: moment(slot.heure_debut, 'HH:mm:ss').format('HH:mm')
      }));
      
      res.json({
        success: true,
        date: date,
        slots: availableSlots
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des créneaux'
      });
    }
  }

  // Créer un nouveau rendez-vous
  async createAppointment(req, res) {
    try {
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
      
      // Validation des données obligatoires
      const requiredFields = ['nom', 'prenom', 'sexe', 'adresse', 'telephone', 'niveau_scolaire', 'date_rdv', 'heure_rdv'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Champs obligatoires manquants',
          missingFields
        });
      }

      // Validation du format de la date
      if (!moment(date_rdv, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide'
        });
      }

      // Validation du format de l'heure
      if (!moment(heure_rdv, 'HH:mm:ss', true).isValid() && !moment(heure_rdv, 'HH:mm', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'heure invalide'
        });
      }

      // Normaliser le format de l'heure
      const normalizedTime = heure_rdv.length === 5 ? `${heure_rdv}:00` : heure_rdv;
      
      // Vérifier que le créneau est encore disponible
      const checkSlotQuery = `
        SELECT id FROM appointments 
        WHERE date_rdv = ? AND heure_rdv = ? AND statut IN ('confirmé', 'en_attente')
      `;
      const existingAppointment = await executeQuery(checkSlotQuery, [date_rdv, normalizedTime]);
      
      if (existingAppointment.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ce créneau horaire n\'est plus disponible'
        });
      }
      
      // Vérifier que la date n'est pas dans le passé
      if (moment(date_rdv).isBefore(moment(), 'day')) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de réserver un rendez-vous dans le passé'
        });
      }

      // Validation du numéro de téléphone marocain
      const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
      if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Format de numéro de téléphone invalide'
        });
      }
      
      // Insérer le nouveau rendez-vous
      const insertQuery = `
        INSERT INTO appointments (
          nom, prenom, sexe, adresse, telephone, niveau_scolaire, 
          date_rdv, heure_rdv, statut
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')
      `;
      
      const result = await executeQuery(insertQuery, [
        nom.trim(), 
        prenom.trim(), 
        sexe, 
        adresse.trim(), 
        telephone.trim(), 
        niveau_scolaire, 
        date_rdv, 
        normalizedTime
      ]);
      
      // Récupérer le rendez-vous créé
      const getAppointmentQuery = `
        SELECT * FROM appointments WHERE id = ?
      `;
      const newAppointment = await executeQuery(getAppointmentQuery, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        appointment: newAppointment[0]
      });
      
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du rendez-vous'
      });
    }
  }

  // Récupérer un rendez-vous par ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de rendez-vous invalide'
        });
      }
      
      const query = `
        SELECT * FROM appointments WHERE id = ?
      `;
      const appointments = await executeQuery(query, [id]);
      
      if (appointments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }
      
      res.json({
        success: true,
        appointment: appointments[0]
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du rendez-vous'
      });
    }
  }

  // Vérifier et récupérer les détails d'un rendez-vous
  async verifyAppointment(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de rendez-vous invalide'
        });
      }
      
      const query = `
        SELECT 
          id, nom, prenom, sexe, telephone, date_rdv, heure_rdv, 
          statut, created_at, niveau_scolaire, adresse
        FROM appointments 
        WHERE id = ?
      `;
      const appointments = await executeQuery(query, [id]);
      
      if (appointments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }
      
      const appointment = appointments[0];
      
      // Formater les données pour l'affichage
      const formattedAppointment = {
        ...appointment,
        date_formatted: moment(appointment.date_rdv).format('DD/MM/YYYY'),
        heure_formatted: moment(appointment.heure_rdv, 'HH:mm:ss').format('HH:mm'),
        created_formatted: moment(appointment.created_at).format('DD/MM/YYYY à HH:mm')
      };
      
      res.json({
        success: true,
        appointment: formattedAppointment
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du rendez-vous'
      });
    }
  }

  // Annuler un rendez-vous (optionnel)
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de rendez-vous invalide'
        });
      }
      
      // Vérifier que le rendez-vous existe
      const checkQuery = 'SELECT id, statut FROM appointments WHERE id = ?';
      const existing = await executeQuery(checkQuery, [id]);
      
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      if (existing[0].statut === 'annulé') {
        return res.status(400).json({
          success: false,
          message: 'Ce rendez-vous est déjà annulé'
        });
      }
      
      // Mettre à jour le statut
      const updateQuery = `
        UPDATE appointments 
        SET statut = 'annulé', notes = CONCAT(COALESCE(notes, ''), '\nAnnulé: ', ?), updated_at = NOW()
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, [reason || 'Annulation par l\'utilisateur', id]);
      
      res.json({
        success: true,
        message: 'Rendez-vous annulé avec succès'
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation du rendez-vous'
      });
    }
  }
}

module.exports = new AppointmentController();