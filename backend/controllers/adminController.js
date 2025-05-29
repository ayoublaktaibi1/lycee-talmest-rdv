const { executeQuery } = require('../config/database');
const moment = require('moment');

// Contrôleur pour la gestion administrative
class AdminController {

  // Récupérer tous les rendez-vous avec filtres et pagination
  async getAppointments(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        date = null, 
        statut = null, 
        search = null 
      } = req.query;
      
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];
      
      // Filtres
      if (date) {
        whereConditions.push('date_rdv = ?');
        queryParams.push(date);
      }
      
      if (statut) {
        whereConditions.push('statut = ?');
        queryParams.push(statut);
      }
      
      if (search) {
        whereConditions.push('(nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?)');
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      
      // Requête pour compter le total
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM appointments 
        ${whereClause}
      `;
      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult[0].total;
      
      // Requête pour récupérer les rendez-vous
      const appointmentsQuery = `
        SELECT 
          id, nom, prenom, sexe, adresse, telephone, niveau_scolaire,
          date_rdv, heure_rdv, statut, notes, created_at, updated_at
        FROM appointments 
        ${whereClause}
        ORDER BY date_rdv DESC, heure_rdv DESC, created_at DESC
        LIMIT ? OFFSET ?
      `;
      queryParams.push(parseInt(limit), parseInt(offset));
      
      const appointments = await executeQuery(appointmentsQuery, queryParams);
      
      // Formater les données
      const formattedAppointments = appointments.map(appointment => ({
        ...appointment,
        date_formatted: moment(appointment.date_rdv).format('DD/MM/YYYY'),
        heure_formatted: moment(appointment.heure_rdv, 'HH:mm:ss').format('HH:mm'),
        created_formatted: moment(appointment.created_at).format('DD/MM/YYYY à HH:mm'),
        updated_formatted: appointment.updated_at ? moment(appointment.updated_at).format('DD/MM/YYYY à HH:mm') : null
      }));
      
      res.json({
        success: true,
        appointments: formattedAppointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rendez-vous'
      });
    }
  }

  // Modifier un rendez-vous
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const {
        nom,
        prenom,
        sexe,
        adresse,
        telephone,
        niveau_scolaire,
        date_rdv,
        heure_rdv,
        statut,
        notes
      } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de rendez-vous invalide'
        });
      }
      
      // Vérifier que le rendez-vous existe
      const checkQuery = 'SELECT id FROM appointments WHERE id = ?';
      const existing = await executeQuery(checkQuery, [id]);
      
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }
      
      // Si on change la date/heure, vérifier la disponibilité
      if (date_rdv && heure_rdv) {
        // Normaliser l'heure
        const normalizedTime = heure_rdv.length === 5 ? `${heure_rdv}:00` : heure_rdv;
        
        const conflictQuery = `
          SELECT id FROM appointments 
          WHERE date_rdv = ? AND heure_rdv = ? AND id != ? 
          AND statut IN ('confirmé', 'en_attente')
        `;
        const conflicts = await executeQuery(conflictQuery, [date_rdv, normalizedTime, id]);
        
        if (conflicts.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Ce créneau horaire est déjà occupé'
          });
        }
      }

      // Validation des données si fournies
      if (telephone) {
        const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
        if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
          return res.status(400).json({
            success: false,
            message: 'Format de numéro de téléphone invalide'
          });
        }
      }

      if (date_rdv && !moment(date_rdv, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide'
        });
      }

      if (heure_rdv && !moment(heure_rdv, 'HH:mm:ss', true).isValid() && !moment(heure_rdv, 'HH:mm', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'heure invalide'
        });
      }
      
      // Préparer les champs à mettre à jour
      const fieldsToUpdate = [];
      const values = [];
      
      if (nom !== undefined) {
        fieldsToUpdate.push('nom = ?');
        values.push(nom.trim());
      }
      if (prenom !== undefined) {
        fieldsToUpdate.push('prenom = ?');
        values.push(prenom.trim());
      }
      if (sexe !== undefined) {
        fieldsToUpdate.push('sexe = ?');
        values.push(sexe);
      }
      if (adresse !== undefined) {
        fieldsToUpdate.push('adresse = ?');
        values.push(adresse.trim());
      }
      if (telephone !== undefined) {
        fieldsToUpdate.push('telephone = ?');
        values.push(telephone.trim());
      }
      if (niveau_scolaire !== undefined) {
        fieldsToUpdate.push('niveau_scolaire = ?');
        values.push(niveau_scolaire);
      }
      if (date_rdv !== undefined) {
        fieldsToUpdate.push('date_rdv = ?');
        values.push(date_rdv);
      }
      if (heure_rdv !== undefined) {
        const normalizedTime = heure_rdv.length === 5 ? `${heure_rdv}:00` : heure_rdv;
        fieldsToUpdate.push('heure_rdv = ?');
        values.push(normalizedTime);
      }
      if (statut !== undefined) {
        fieldsToUpdate.push('statut = ?');
        values.push(statut);
      }
      if (notes !== undefined) {
        fieldsToUpdate.push('notes = ?');
        values.push(notes);
      }
      
      fieldsToUpdate.push('updated_at = NOW()');
      values.push(id);
      
      // Mettre à jour le rendez-vous
      const updateQuery = `
        UPDATE appointments SET ${fieldsToUpdate.join(', ')} WHERE id = ?
      `;
      
      await executeQuery(updateQuery, values);
      
      // Récupérer le rendez-vous mis à jour
      const getUpdatedQuery = 'SELECT * FROM appointments WHERE id = ?';
      const updated = await executeQuery(getUpdatedQuery, [id]);
      
      res.json({
        success: true,
        message: 'Rendez-vous mis à jour avec succès',
        appointment: updated[0]
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du rendez-vous'
      });
    }
  }

  // Supprimer un rendez-vous
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de rendez-vous invalide'
        });
      }
      
      // Vérifier que le rendez-vous existe
      const checkQuery = 'SELECT id, nom, prenom FROM appointments WHERE id = ?';
      const existing = await executeQuery(checkQuery, [id]);
      
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }
      
      // Supprimer le rendez-vous
      const deleteQuery = 'DELETE FROM appointments WHERE id = ?';
      await executeQuery(deleteQuery, [id]);
      
      res.json({
        success: true,
        message: `Rendez-vous de ${existing[0].prenom} ${existing[0].nom} supprimé avec succès`
      });
      
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du rendez-vous'
      });
    }
  }

  // Récupérer les statistiques
  async getStatistics(req, res) {
    try {
      // Statistiques générales
      const generalStatsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN statut = 'confirmé' THEN 1 END) as confirmed,
          COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as pending,
          COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as cancelled,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_appointments
        FROM appointments
      `;
      const generalStats = await executeQuery(generalStatsQuery);
      
      // Statistiques par jour (7 derniers jours)
      const dailyStatsQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM appointments 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      const dailyStats = await executeQuery(dailyStatsQuery);
      
      // Statistiques par niveau scolaire
      const levelStatsQuery = `
        SELECT 
          niveau_scolaire,
          COUNT(*) as count
        FROM appointments
        GROUP BY niveau_scolaire
        ORDER BY count DESC
        LIMIT 10
      `;
      const levelStats = await executeQuery(levelStatsQuery);
      
      // Statistiques par statut
      const statusStatsQuery = `
        SELECT 
          statut,
          COUNT(*) as count
        FROM appointments
        GROUP BY statut
      `;
      const statusStats = await executeQuery(statusStatsQuery);
      
      // Rendez-vous à venir (prochains 7 jours)
      const upcomingQuery = `
        SELECT 
          DATE(date_rdv) as date,
          COUNT(*) as count
        FROM appointments 
        WHERE date_rdv BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND statut IN ('confirmé', 'en_attente')
        GROUP BY DATE(date_rdv)
        ORDER BY date ASC
      `;
      const upcomingStats = await executeQuery(upcomingQuery);

      // Statistiques par sexe
      const genderStatsQuery = `
        SELECT 
          sexe,
          COUNT(*) as count
        FROM appointments
        GROUP BY sexe
      `;
      const genderStats = await executeQuery(genderStatsQuery);

      // Créneaux les plus demandés
      const popularSlotsQuery = `
        SELECT 
          heure_rdv,
          COUNT(*) as count
        FROM appointments
        GROUP BY heure_rdv
        ORDER BY count DESC
        LIMIT 5
      `;
      const popularSlots = await executeQuery(popularSlotsQuery);
      
      res.json({
        success: true,
        statistics: {
          general: generalStats[0],
          daily: dailyStats.map(stat => ({
            ...stat,
            date_formatted: moment(stat.date).format('DD/MM/YYYY')
          })),
          byLevel: levelStats,
          byStatus: statusStats,
          byGender: genderStats,
          popularSlots: popularSlots.map(slot => ({
            ...slot,
            heure_formatted: moment(slot.heure_rdv, 'HH:mm:ss').format('HH:mm')
          })),
          upcoming: upcomingStats.map(stat => ({
            ...stat,
            date_formatted: moment(stat.date).format('DD/MM/YYYY')
          }))
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // Exporter les rendez-vous d'une date
  async exportAppointmentsByDate(req, res) {
    try {
      const { date } = req.params;
      
      // Valider le format de la date
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide'
        });
      }
      
      const query = `
        SELECT 
          id, nom, prenom, sexe, adresse, telephone, niveau_scolaire,
          date_rdv, heure_rdv, statut, notes, created_at
        FROM appointments 
        WHERE date_rdv = ?
        ORDER BY heure_rdv ASC
      `;
      
      const appointments = await executeQuery(query, [date]);
      
      // Formater les données pour l'export
      const formattedAppointments = appointments.map(appointment => ({
        ...appointment,
        date_formatted: moment(appointment.date_rdv).format('DD/MM/YYYY'),
        heure_formatted: moment(appointment.heure_rdv, 'HH:mm:ss').format('HH:mm'),
        created_formatted: moment(appointment.created_at).format('DD/MM/YYYY à HH:mm')
      }));

      // Statistiques pour cette date
      const stats = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.statut === 'confirmé').length,
        pending: appointments.filter(a => a.statut === 'en_attente').length,
        cancelled: appointments.filter(a => a.statut === 'annulé').length
      };
      
      res.json({
        success: true,
        date: date,
        date_formatted: moment(date).format('DD/MM/YYYY'),
        appointments: formattedAppointments,
        statistics: stats,
        exportedAt: moment().format('DD/MM/YYYY à HH:mm')
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export des rendez-vous:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export des rendez-vous'
      });
    }
  }

  // Récupérer les créneaux horaires
  async getTimeSlots(req, res) {
    try {
      const query = `
        SELECT id, heure_debut, heure_fin, actif, created_at
        FROM time_slots
        ORDER BY heure_debut ASC
      `;
      
      const slots = await executeQuery(query);
      
      const formattedSlots = slots.map(slot => ({
        ...slot,
        heure_debut_formatted: moment(slot.heure_debut, 'HH:mm:ss').format('HH:mm'),
        heure_fin_formatted: moment(slot.heure_fin, 'HH:mm:ss').format('HH:mm'),
        created_formatted: moment(slot.created_at).format('DD/MM/YYYY à HH:mm')
      }));
      
      res.json({
        success: true,
        slots: formattedSlots
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des créneaux'
      });
    }
  }

  // Activer/désactiver un créneau horaire
  async toggleTimeSlot(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de créneau invalide'
        });
      }
      
      // Récupérer l'état actuel
      const currentQuery = 'SELECT actif FROM time_slots WHERE id = ?';
      const current = await executeQuery(currentQuery, [id]);
      
      if (current.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Créneau horaire non trouvé'
        });
      }
      
      const newStatus = !current[0].actif;
      
      // Mettre à jour le statut
      const updateQuery = 'UPDATE time_slots SET actif = ? WHERE id = ?';
      await executeQuery(updateQuery, [newStatus, id]);
      
      res.json({
        success: true,
        message: `Créneau horaire ${newStatus ? 'activé' : 'désactivé'} avec succès`,
        newStatus
      });
      
    } catch (error) {
      console.error('Erreur lors de la modification du créneau:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la modification du créneau'
      });
    }
  }

  // Ajouter un nouveau créneau horaire
  async addTimeSlot(req, res) {
    try {
      const { heure_debut, heure_fin } = req.body;
      
      if (!heure_debut || !heure_fin) {
        return res.status(400).json({
          success: false,
          message: 'Heure de début et de fin requises'
        });
      }

      // Valider les formats d'heure
      if (!moment(heure_debut, 'HH:mm', true).isValid() || !moment(heure_fin, 'HH:mm', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'heure invalide (HH:mm requis)'
        });
      }

      // Vérifier que l'heure de fin est après l'heure de début
      if (moment(heure_fin, 'HH:mm').isSameOrBefore(moment(heure_debut, 'HH:mm'))) {
        return res.status(400).json({
          success: false,
          message: 'L\'heure de fin doit être après l\'heure de début'
        });
      }

      // Vérifier qu'il n'y a pas de conflit avec les créneaux existants
      const conflictQuery = `
        SELECT id FROM time_slots 
        WHERE (
          (? >= heure_debut AND ? < heure_fin) OR
          (? > heure_debut AND ? <= heure_fin) OR
          (? <= heure_debut AND ? >= heure_fin)
        )
      `;
      const conflicts = await executeQuery(conflictQuery, [
        `${heure_debut}:00`, `${heure_debut}:00`,
        `${heure_fin}:00`, `${heure_fin}:00`,
        `${heure_debut}:00`, `${heure_fin}:00`
      ]);

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ce créneau horaire entre en conflit avec un créneau existant'
        });
      }

      // Ajouter le nouveau créneau
      const insertQuery = `
        INSERT INTO time_slots (heure_debut, heure_fin, actif) 
        VALUES (?, ?, TRUE)
      `;
      const result = await executeQuery(insertQuery, [`${heure_debut}:00`, `${heure_fin}:00`]);

      // Récupérer le créneau créé
      const newSlotQuery = 'SELECT * FROM time_slots WHERE id = ?';
      const newSlot = await executeQuery(newSlotQuery, [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Créneau horaire ajouté avec succès',
        slot: {
          ...newSlot[0],
          heure_debut_formatted: moment(newSlot[0].heure_debut, 'HH:mm:ss').format('HH:mm'),
          heure_fin_formatted: moment(newSlot[0].heure_fin, 'HH:mm:ss').format('HH:mm')
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du créneau:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout du créneau'
      });
    }
  }

  // Supprimer un créneau horaire
  async deleteTimeSlot(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de créneau invalide'
        });
      }

      // Vérifier que le créneau existe
      const checkQuery = 'SELECT id, heure_debut, heure_fin FROM time_slots WHERE id = ?';
      const existing = await executeQuery(checkQuery, [id]);
      
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Créneau horaire non trouvé'
        });
      }

      // Vérifier qu'il n'y a pas de rendez-vous associés à ce créneau
      const appointmentsQuery = `
        SELECT COUNT(*) as count FROM appointments 
        WHERE heure_rdv = ? AND statut IN ('confirmé', 'en_attente')
      `;
      const appointmentsCount = await executeQuery(appointmentsQuery, [existing[0].heure_debut]);

      if (appointmentsCount[0].count > 0) {
        return res.status(409).json({
          success: false,
          message: `Impossible de supprimer ce créneau car ${appointmentsCount[0].count} rendez-vous y sont associés`
        });
      }

      // Supprimer le créneau
      const deleteQuery = 'DELETE FROM time_slots WHERE id = ?';
      await executeQuery(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Créneau horaire supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du créneau:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du créneau'
      });
    }
  }

  // Récupérer les jours fermés
  async getClosedDays(req, res) {
    try {
      const query = `
        SELECT id, date_fermeture, raison, created_at
        FROM closed_days
        ORDER BY date_fermeture DESC
      `;
      
      const closedDays = await executeQuery(query);
      
      const formattedDays = closedDays.map(day => ({
        ...day,
        date_formatted: moment(day.date_fermeture).format('DD/MM/YYYY'),
        created_formatted: moment(day.created_at).format('DD/MM/YYYY à HH:mm')
      }));
      
      res.json({
        success: true,
        closedDays: formattedDays
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération des jours fermés:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des jours fermés'
      });
    }
  }

  // Ajouter un jour fermé
  async addClosedDay(req, res) {
    try {
      const { date_fermeture, raison } = req.body;
      
      if (!date_fermeture) {
        return res.status(400).json({
          success: false,
          message: 'Date de fermeture requise'
        });
      }

      // Valider le format de la date
      if (!moment(date_fermeture, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Format de date invalide'
        });
      }

      // Vérifier que la date n'existe pas déjà
      const existingQuery = 'SELECT id FROM closed_days WHERE date_fermeture = ?';
      const existing = await executeQuery(existingQuery, [date_fermeture]);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cette date est déjà marquée comme fermée'
        });
      }

      // Ajouter le jour fermé
      const insertQuery = `
        INSERT INTO closed_days (date_fermeture, raison) 
        VALUES (?, ?)
      `;
      const result = await executeQuery(insertQuery, [date_fermeture, raison || 'Fermeture']);

      // Récupérer le jour fermé créé
      const newDayQuery = 'SELECT * FROM closed_days WHERE id = ?';
      const newDay = await executeQuery(newDayQuery, [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Jour de fermeture ajouté avec succès',
        closedDay: {
          ...newDay[0],
          date_formatted: moment(newDay[0].date_fermeture).format('DD/MM/YYYY')
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du jour fermé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'ajout du jour fermé'
      });
    }
  }
}

module.exports = new AdminController();