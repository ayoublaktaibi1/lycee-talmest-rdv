const { executeQuery } = require('../config/database');
const moment = require('moment');

// Modèle pour la gestion des rendez-vous
class Appointment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nom = data.nom || '';
    this.prenom = data.prenom || '';
    this.sexe = data.sexe || '';
    this.adresse = data.adresse || '';
    this.telephone = data.telephone || '';
    this.niveau_scolaire = data.niveau_scolaire || '';
    this.date_rdv = data.date_rdv || null;
    this.heure_rdv = data.heure_rdv || null;
    this.statut = data.statut || 'en_attente';
    this.notes = data.notes || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Valider les données du rendez-vous
  validate() {
    const errors = [];

    if (!this.nom || this.nom.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!this.prenom || this.prenom.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!this.sexe || !['ذكر', 'أنثى'].includes(this.sexe)) {
      errors.push('Le sexe doit être "ذكر" ou "أنثى"');
    }

    if (!this.adresse || this.adresse.trim().length < 10) {
      errors.push('L\'adresse doit contenir au moins 10 caractères');
    }

    if (!this.telephone) {
      errors.push('Le numéro de téléphone est requis');
    } else {
      const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
      if (!phoneRegex.test(this.telephone.replace(/\s/g, ''))) {
        errors.push('Format de numéro de téléphone marocain invalide');
      }
    }

    if (!this.niveau_scolaire) {
      errors.push('Le niveau scolaire est requis');
    }

    if (!this.date_rdv) {
      errors.push('La date du rendez-vous est requise');
    } else if (!moment(this.date_rdv, 'YYYY-MM-DD', true).isValid()) {
      errors.push('Format de date invalide');
    }

    if (!this.heure_rdv) {
      errors.push('L\'heure du rendez-vous est requise');
    } else if (!moment(this.heure_rdv, 'HH:mm:ss', true).isValid() && !moment(this.heure_rdv, 'HH:mm', true).isValid()) {
      errors.push('Format d\'heure invalide');
    }

    if (!['confirmé', 'en_attente', 'annulé'].includes(this.statut)) {
      errors.push('Statut invalide');
    }

    return errors;
  }

  // Sauvegarder le rendez-vous (création ou mise à jour)
  async save() {
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Données invalides: ${errors.join(', ')}`);
    }

    // Normaliser l'heure
    const normalizedTime = this.heure_rdv.length === 5 ? `${this.heure_rdv}:00` : this.heure_rdv;

    if (this.id) {
      // Mise à jour
      const query = `
        UPDATE appointments SET 
          nom = ?, prenom = ?, sexe = ?, adresse = ?, telephone = ?,
          niveau_scolaire = ?, date_rdv = ?, heure_rdv = ?, 
          statut = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await executeQuery(query, [
        this.nom.trim(),
        this.prenom.trim(),
        this.sexe,
        this.adresse.trim(),
        this.telephone.trim(),
        this.niveau_scolaire,
        this.date_rdv,
        normalizedTime,
        this.statut,
        this.notes,
        this.id
      ]);
    } else {
      // Création
      const query = `
        INSERT INTO appointments (
          nom, prenom, sexe, adresse, telephone, niveau_scolaire, 
          date_rdv, heure_rdv, statut, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        this.nom.trim(),
        this.prenom.trim(),
        this.sexe,
        this.adresse.trim(),
        this.telephone.trim(),
        this.niveau_scolaire,
        this.date_rdv,
        normalizedTime,
        this.statut,
        this.notes
      ]);
      
      this.id = result.insertId;
    }

    return this;
  }

  // Supprimer le rendez-vous
  async delete() {
    if (!this.id) {
      throw new Error('Impossible de supprimer un rendez-vous sans ID');
    }

    const query = 'DELETE FROM appointments WHERE id = ?';
    await executeQuery(query, [this.id]);
    
    return true;
  }

  // Vérifier si le créneau est disponible
  async isSlotAvailable() {
    if (!this.date_rdv || !this.heure_rdv) {
      return false;
    }

    const normalizedTime = this.heure_rdv.length === 5 ? `${this.heure_rdv}:00` : this.heure_rdv;
    
    const query = `
      SELECT id FROM appointments 
      WHERE date_rdv = ? AND heure_rdv = ? AND statut IN ('confirmé', 'en_attente')
      ${this.id ? 'AND id != ?' : ''}
    `;
    
    const params = [this.date_rdv, normalizedTime];
    if (this.id) {
      params.push(this.id);
    }
    
    const conflicts = await executeQuery(query, params);
    return conflicts.length === 0;
  }

  // Formater les données pour l'affichage
  toDisplayFormat() {
    return {
      ...this.toJSON(),
      date_formatted: this.date_rdv ? moment(this.date_rdv).format('DD/MM/YYYY') : null,
      heure_formatted: this.heure_rdv ? moment(this.heure_rdv, 'HH:mm:ss').format('HH:mm') : null,
      created_formatted: this.created_at ? moment(this.created_at).format('DD/MM/YYYY à HH:mm') : null,
      updated_formatted: this.updated_at ? moment(this.updated_at).format('DD/MM/YYYY à HH:mm') : null,
      nom_complet: `${this.prenom} ${this.nom}`.trim()
    };
  }

  // Convertir en JSON
  toJSON() {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      sexe: this.sexe,
      adresse: this.adresse,
      telephone: this.telephone,
      niveau_scolaire: this.niveau_scolaire,
      date_rdv: this.date_rdv,
      heure_rdv: this.heure_rdv,
      statut: this.statut,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Méthodes statiques pour les requêtes

  // Trouver un rendez-vous par ID
  static async findById(id) {
    const query = 'SELECT * FROM appointments WHERE id = ?';
    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    return new Appointment(results[0]);
  }

  // Trouver tous les rendez-vous avec filtres
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM appointments';
    let whereConditions = [];
    let params = [];

    if (filters.date) {
      whereConditions.push('date_rdv = ?');
      params.push(filters.date);
    }

    if (filters.statut) {
      whereConditions.push('statut = ?');
      params.push(filters.statut);
    }

    if (filters.search) {
      whereConditions.push('(nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?)');
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY date_rdv DESC, heure_rdv DESC, created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));

      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const results = await executeQuery(query, params);
    return results.map(row => new Appointment(row));
  }

  // Compter les rendez-vous avec filtres
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM appointments';
    let whereConditions = [];
    let params = [];

    if (filters.date) {
      whereConditions.push('date_rdv = ?');
      params.push(filters.date);
    }

    if (filters.statut) {
      whereConditions.push('statut = ?');
      params.push(filters.statut);
    }

    if (filters.search) {
      whereConditions.push('(nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?)');
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    const result = await executeQuery(query, params);
    return result[0].total;
  }

  // Trouver les rendez-vous d'une date spécifique
  static async findByDate(date) {
    const query = `
      SELECT * FROM appointments 
      WHERE date_rdv = ? 
      ORDER BY heure_rdv ASC
    `;
    
    const results = await executeQuery(query, [date]);
    return results.map(row => new Appointment(row));
  }

  // Trouver les rendez-vous à venir
  static async findUpcoming(days = 7) {
    const endDate = moment().add(days, 'days').format('YYYY-MM-DD');
    
    const query = `
      SELECT * FROM appointments 
      WHERE date_rdv BETWEEN CURDATE() AND ? 
      AND statut IN ('confirmé', 'en_attente')
      ORDER BY date_rdv ASC, heure_rdv ASC
    `;
    
    const results = await executeQuery(query, [endDate]);
    return results.map(row => new Appointment(row));
  }

  // Vérifier si un créneau est occupé
  static async isSlotOccupied(date, time, excludeId = null) {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    
    let query = `
      SELECT id FROM appointments 
      WHERE date_rdv = ? AND heure_rdv = ? AND statut IN ('confirmé', 'en_attente')
    `;
    let params = [date, normalizedTime];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await executeQuery(query, params);
    return results.length > 0;
  }

  // Obtenir les statistiques
  static async getStatistics() {
    const queries = {
      general: `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN statut = 'confirmé' THEN 1 END) as confirmed,
          COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as pending,
          COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as cancelled,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_appointments
        FROM appointments
      `,
      
      byStatus: `
        SELECT statut, COUNT(*) as count
        FROM appointments
        GROUP BY statut
      `,
      
      byLevel: `
        SELECT niveau_scolaire, COUNT(*) as count
        FROM appointments
        GROUP BY niveau_scolaire
        ORDER BY count DESC
      `,
      
      byGender: `
        SELECT sexe, COUNT(*) as count
        FROM appointments
        GROUP BY sexe
      `,
      
      daily: `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM appointments 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
      
      upcoming: `
        SELECT 
          DATE(date_rdv) as date,
          COUNT(*) as count
        FROM appointments 
        WHERE date_rdv BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND statut IN ('confirmé', 'en_attente')
        GROUP BY DATE(date_rdv)
        ORDER BY date ASC
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      results[key] = await executeQuery(query);
    }

    return results;
  }

  // Nettoyer les anciens rendez-vous
  static async cleanupOld(monthsOld = 6) {
    const cutoffDate = moment().subtract(monthsOld, 'months').format('YYYY-MM-DD');
    
    const query = `
      DELETE FROM appointments 
      WHERE date_rdv < ? AND statut = 'annulé'
    `;
    
    const result = await executeQuery(query, [cutoffDate]);
    return result.affectedRows;
  }

  // Obtenir les créneaux populaires
  static async getPopularSlots(limit = 10) {
    const query = `
      SELECT 
        heure_rdv,
        COUNT(*) as count
      FROM appointments
      GROUP BY heure_rdv
      ORDER BY count DESC
      LIMIT ?
    `;
    
    const results = await executeQuery(query, [limit]);
    return results.map(row => ({
      ...row,
      heure_formatted: moment(row.heure_rdv, 'HH:mm:ss').format('HH:mm')
    }));
  }

  // Recherche avancée
  static async search(searchTerm, filters = {}) {
    let query = `
      SELECT * FROM appointments 
      WHERE (
        nom LIKE ? OR 
        prenom LIKE ? OR 
        telephone LIKE ? OR 
        adresse LIKE ? OR
        niveau_scolaire LIKE ? OR
        notes LIKE ?
      )
    `;
    
    const searchPattern = `%${searchTerm}%`;
    let params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    
    if (filters.statut) {
      query += ' AND statut = ?';
      params.push(filters.statut);
    }
    
    if (filters.dateFrom) {
      query += ' AND date_rdv >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ' AND date_rdv <= ?';
      params.push(filters.dateTo);
    }
    
    query += ' ORDER BY date_rdv DESC, heure_rdv DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const results = await executeQuery(query, params);
    return results.map(row => new Appointment(row));
  }

  // Dupliquer un rendez-vous (pour reporter)
  async duplicate(newDate, newTime) {
    const duplicatedData = { ...this.toJSON() };
    delete duplicatedData.id;
    delete duplicatedData.created_at;
    delete duplicatedData.updated_at;
    
    duplicatedData.date_rdv = newDate;
    duplicatedData.heure_rdv = newTime;
    duplicatedData.statut = 'en_attente';
    duplicatedData.notes = `Reporté du ${this.date_rdv} à ${this.heure_rdv}. ${duplicatedData.notes || ''}`.trim();
    
    const newAppointment = new Appointment(duplicatedData);
    return await newAppointment.save();
  }

  // Confirmer un rendez-vous
  async confirm(notes = '') {
    this.statut = 'confirmé';
    if (notes) {
      this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
    }
    return await this.save();
  }

  // Annuler un rendez-vous
  async cancel(reason = '') {
    this.statut = 'annulé';
    const cancelNote = `Annulé le ${moment().format('DD/MM/YYYY à HH:mm')}${reason ? ': ' + reason : ''}`;
    this.notes = this.notes ? `${this.notes}\n${cancelNote}` : cancelNote;
    return await this.save();
  }

  // Reprogrammer un rendez-vous
  async reschedule(newDate, newTime, reason = '') {
    const oldDate = this.date_rdv;
    const oldTime = this.heure_rdv;
    
    this.date_rdv = newDate;
    this.heure_rdv = newTime;
    
    const rescheduleNote = `Reprogrammé du ${moment(oldDate).format('DD/MM/YYYY')} ${moment(oldTime, 'HH:mm:ss').format('HH:mm')} vers ${moment(newDate).format('DD/MM/YYYY')} ${moment(newTime, 'HH:mm:ss').format('HH:mm')}${reason ? ': ' + reason : ''}`;
    this.notes = this.notes ? `${this.notes}\n${rescheduleNote}` : rescheduleNote;
    
    return await this.save();
  }
}

module.exports = Appointment;