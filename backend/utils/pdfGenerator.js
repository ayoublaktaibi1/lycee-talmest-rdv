const moment = require('moment');

// Utilitaires pour générer des PDFs côté serveur (si besoin)
// Note: La génération PDF est principalement faite côté client avec jsPDF

class PDFGenerator {
  
  // Générer les données formatées pour un rendez-vous
  static formatAppointmentForPDF(appointment) {
    return {
      id: appointment.id,
      reference: `RDV-${String(appointment.id).padStart(6, '0')}`,
      nom_complet: `${appointment.prenom} ${appointment.nom}`,
      sexe: appointment.sexe,
      telephone: appointment.telephone,
      adresse: appointment.adresse,
      niveau_scolaire: appointment.niveau_scolaire,
      date_rdv: moment(appointment.date_rdv).format('DD/MM/YYYY'),
      heure_rdv: moment(appointment.heure_rdv, 'HH:mm:ss').format('HH:mm'),
      statut: appointment.statut,
      statut_fr: this.getStatusInFrench(appointment.statut),
      created_at: moment(appointment.created_at).format('DD/MM/YYYY à HH:mm'),
      notes: appointment.notes || ''
    };
  }

  // Générer les données pour une liste de rendez-vous (export quotidien)
  static formatAppointmentListForPDF(appointments, date) {
    const formattedDate = moment(date).format('DD/MM/YYYY');
    const dayName = moment(date).format('dddd');
    
    const formattedAppointments = appointments.map(appointment => ({
      ...this.formatAppointmentForPDF(appointment),
      heure_creneau: moment(appointment.heure_rdv, 'HH:mm:ss').format('HH:mm')
    }));

    // Statistiques pour cette date
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.statut === 'confirmé').length,
      pending: appointments.filter(a => a.statut === 'en_attente').length,
      cancelled: appointments.filter(a => a.statut === 'annulé').length
    };

    return {
      date: date,
      date_formatted: formattedDate,
      day_name: dayName,
      appointments: formattedAppointments,
      statistics: stats,
      generated_at: moment().format('DD/MM/YYYY à HH:mm'),
      school_info: this.getSchoolInfo()
    };
  }

  // Informations de l'école
  static getSchoolInfo() {
    return {
      name_ar: process.env.SCHOOL_NAME || 'الثانوية التأهيلية تالمست',
      name_fr: process.env.SCHOOL_NAME_FR || 'Lycée Qualifiant Talmest',
      address: process.env.SCHOOL_ADDRESS || 'تالمست، المغرب',
      phone: process.env.SCHOOL_PHONE || '+212 5XX XX XX XX',
      email: process.env.SCHOOL_EMAIL || 'contact@lycee-talmest.ma'
    };
  }

  // Convertir le statut en français
  static getStatusInFrench(statut) {
    const statusMap = {
      'confirmé': 'Confirmé',
      'en_attente': 'En attente',
      'annulé': 'Annulé'
    };
    return statusMap[statut] || statut;
  }

  // Convertir le statut en arabe
  static getStatusInArabic(statut) {
    const statusMap = {
      'confirmé': 'مؤكد',
      'en_attente': 'في الانتظار',
      'annulé': 'ملغى'
    };
    return statusMap[statut] || statut;
  }

  // Template HTML pour un rendez-vous (si on veut générer du HTML)
  static generateAppointmentHTML(appointment) {
    const data = this.formatAppointmentForPDF(appointment);
    const school = this.getSchoolInfo();
    
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد الموعد - ${data.reference}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
          }
          
          body {
            direction: rtl;
            text-align: right;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .header h2 {
            font-size: 18px;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }
          
          .info-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-right: 4px solid #2563eb;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #6b7280;
          }
          
          .appointment-details {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
          }
          
          .appointment-details .date {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          
          .appointment-details .time {
            font-size: 20px;
            color: #1d4ed8;
          }
          
          .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
          }
          
          .status.confirmed {
            background: #dcfce7;
            color: #166534;
          }
          
          .status.pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status.cancelled {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .instructions {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .instructions h3 {
            color: #1d4ed8;
            margin-bottom: 15px;
          }
          
          .instructions ul {
            list-style: none;
            padding: 0;
          }
          
          .instructions li {
            margin-bottom: 8px;
            padding-right: 20px;
            position: relative;
          }
          
          .instructions li:before {
            content: '•';
            color: #2563eb;
            position: absolute;
            right: 0;
            font-weight: bold;
          }
          
          .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 15px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${school.name_ar}</h1>
            <h2>${school.name_fr}</h2>
            <p>تأكيد موعد التسجيل</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">معلومات الموعد</div>
              <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 18px; color: #6b7280;">رقم المرجع</div>
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${data.reference}</div>
              </div>
              
              <div class="appointment-details">
                <div class="date">${data.date_rdv}</div>
                <div class="time">${data.heure_rdv}</div>
                <div style="margin-top: 15px;">
                  <span class="status ${appointment.statut}">${this.getStatusInArabic(appointment.statut)}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">بيانات الطالب</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">الاسم الكامل</div>
                  <div class="info-value">${data.nom_complet}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">الجنس</div>
                  <div class="info-value">${data.sexe}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">رقم الهاتف</div>
                  <div class="info-value">${data.telephone}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">المستوى الدراسي</div>
                  <div class="info-value">${data.niveau_scolaire}</div>
                </div>
              </div>
              
              <div class="info-item" style="margin-top: 20px;">
                <div class="info-label">العنوان</div>
                <div class="info-value">${data.adresse}</div>
              </div>
            </div>
            
            <div class="instructions">
              <h3>تعليمات مهمة</h3>
              <ul>
                <li>يرجى الحضور قبل 15 دقيقة من موعدك المحدد</li>
                <li>إحضار جميع الوثائق المطلوبة للتسجيل</li>
                <li>بطاقة التعريف الوطنية أو جواز السفر</li>
                <li>شهادة الباكالوريا أو ما يعادلها</li>
                <li>صور شمسية حديثة</li>
                <li>شهادة طبية (إن أمكن)</li>
                <li>في حالة عدم التمكن من الحضور، يرجى إبلاغ الإدارة مسبقاً</li>
              </ul>
            </div>
            
            ${data.notes ? `
            <div class="section">
              <div class="section-title">ملاحظات إضافية</div>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; color: #374151;">
                ${data.notes}
              </div>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div>
              <strong>${school.name_fr}</strong><br>
              ${school.address}
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <span>📞</span>
                <span>${school.phone}</span>
              </div>
              <div class="contact-item">
                <span>✉️</span>
                <span>${school.email}</span>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 12px;">
              وثيقة مُنشأة بتاريخ ${data.created_at}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Template HTML pour liste des rendez-vous quotidiens
  static generateDailyListHTML(appointmentsData) {
    const school = this.getSchoolInfo();
    
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>قائمة المواعيد - ${appointmentsData.date_formatted}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
          }
          
          body {
            direction: rtl;
            text-align: right;
            line-height: 1.4;
            color: #333;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 24px;
            color: #2563eb;
            margin-bottom: 10px;
          }
          
          .header h2 {
            font-size: 18px;
            color: #6b7280;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-top: 4px solid #2563eb;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
          }
          
          .appointments-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .appointments-table th {
            background: #2563eb;
            color: white;
            padding: 15px 10px;
            font-weight: bold;
            text-align: center;
          }
          
          .appointments-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
          }
          
          .appointments-table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .appointments-table tr:hover {
            background: #f3f4f6;
          }
          
          .status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .status.confirmed {
            background: #dcfce7;
            color: #166534;
          }
          
          .status.pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status.cancelled {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          @media print {
            body { padding: 10px; }
            .stat-card { break-inside: avoid; }
            .appointments-table { break-inside: auto; }
            .appointments-table tr { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${school.name_ar}</h1>
          <h2>قائمة المواعيد - ${appointmentsData.date_formatted} (${appointmentsData.day_name})</h2>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${appointmentsData.statistics.total}</div>
            <div class="stat-label">إجمالي المواعيد</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${appointmentsData.statistics.confirmed}</div>
            <div class="stat-label">مؤكد</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${appointmentsData.statistics.pending}</div>
            <div class="stat-label">في الانتظار</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${appointmentsData.statistics.cancelled}</div>
            <div class="stat-label">ملغى</div>
          </div>
        </div>
        
        ${appointmentsData.appointments.length > 0 ? `
        <table class="appointments-table">
          <thead>
            <tr>
              <th>الوقت</th>
              <th>الاسم الكامل</th>
              <th>الجنس</th>
              <th>الهاتف</th>
              <th>المستوى الدراسي</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${appointmentsData.appointments.map(appointment => `
            <tr>
              <td><strong>${appointment.heure_creneau}</strong></td>
              <td>${appointment.nom_complet}</td>
              <td>${appointment.sexe}</td>
              <td>${appointment.telephone}</td>
              <td style="font-size: 12px;">${appointment.niveau_scolaire}</td>
              <td>
                <span class="status ${appointment.statut}">
                  ${this.getStatusInArabic(appointment.statut)}
                </span>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
        ` : `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <h3>لا توجد مواعيد لهذا اليوم</h3>
        </div>
        `}
        
        <div class="footer">
          <div>
            <strong>${school.name_fr}</strong><br>
            ${school.address} | ${school.phone} | ${school.email}
          </div>
          <div style="margin-top: 10px;">
            وثيقة مُنشأة بتاريخ ${appointmentsData.generated_at}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Générer des données JSON optimisées pour jsPDF côté client
  static generateAppointmentJSON(appointment) {
    return {
      type: 'appointment_confirmation',
      data: this.formatAppointmentForPDF(appointment),
      school: this.getSchoolInfo(),
      template: 'confirmation',
      generated_at: moment().toISOString()
    };
  }

  // Générer des données JSON pour liste quotidienne
  static generateDailyListJSON(appointments, date) {
    return {
      type: 'daily_appointments_list',
      data: this.formatAppointmentListForPDF(appointments, date),
      school: this.getSchoolInfo(),
      template: 'daily_list',
      generated_at: moment().toISOString()
    };
  }

  // Valider les données avant génération PDF
  static validateAppointmentData(appointment) {
    const errors = [];
    
    if (!appointment.id) errors.push('ID du rendez-vous manquant');
    if (!appointment.nom) errors.push('Nom manquant');
    if (!appointment.prenom) errors.push('Prénom manquant');
    if (!appointment.date_rdv) errors.push('Date du rendez-vous manquante');
    if (!appointment.heure_rdv) errors.push('Heure du rendez-vous manquante');
    
    return errors;
  }

  // Nettoyer les données pour éviter les problèmes d'encoding
  static sanitizeDataForPDF(data) {
    if (typeof data === 'string') {
      return data
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Supprimer les caractères de contrôle
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Garder seulement les caractères imprimables
        .trim();
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeDataForPDF(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Générer un nom de fichier unique
  static generateFileName(type, identifier, date = null) {
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const dateStr = date ? moment(date).format('YYYY-MM-DD') : '';
    
    switch (type) {
      case 'appointment':
        return `rendez-vous_${identifier}_${timestamp}.pdf`;
      case 'daily_list':
        return `liste_quotidienne_${dateStr}_${timestamp}.pdf`;
      case 'monthly_report':
        return `rapport_mensuel_${dateStr}_${timestamp}.pdf`;
      default:
        return `document_${timestamp}.pdf`;
    }
  }

  // Obtenir les métadonnées PDF
  static getPDFMetadata(type, title) {
    const school = this.getSchoolInfo();
    
    return {
      title: title || `Document - ${school.name_fr}`,
      author: school.name_fr,
      subject: type === 'appointment' ? 'Confirmation de rendez-vous' : 'Liste des rendez-vous',
      keywords: 'rendez-vous, inscription, lycée, Talmest',
      creator: 'Système de gestion des rendez-vous',
      producer: school.name_fr,
      creationDate: new Date(),
      modDate: new Date()
    };
  }

  // Générer un QR Code data (pour intégration future)
  static generateQRCodeData(appointment) {
    const data = {
      type: 'appointment',
      id: appointment.id,
      reference: `RDV-${String(appointment.id).padStart(6, '0')}`,
      nom: appointment.nom,
      prenom: appointment.prenom,
      date: appointment.date_rdv,
      heure: appointment.heure_rdv,
      verification_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmation/${appointment.id}`
    };
    
    return JSON.stringify(data);
  }

  // Formater l'adresse sur plusieurs lignes
  static formatAddress(address) {
    if (!address) return '';
    
    // Diviser l'adresse en lignes de maximum 40 caractères
    const words = address.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= 40) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    
    return lines;
  }

  // Obtenir la couleur selon le statut
  static getStatusColor(statut) {
    const colors = {
      'confirmé': { bg: '#dcfce7', text: '#166534' },
      'en_attente': { bg: '#fef3c7', text: '#92400e' },
      'annulé': { bg: '#fee2e2', text: '#991b1b' }
    };
    
    return colors[statut] || { bg: '#f3f4f6', text: '#374151' };
  }

  // Calculer les statistiques pour un groupe de rendez-vous
  static calculateStatistics(appointments) {
    const total = appointments.length;
    const byStatus = appointments.reduce((acc, appointment) => {
      acc[appointment.statut] = (acc[appointment.statut] || 0) + 1;
      return acc;
    }, {});
    
    const byGender = appointments.reduce((acc, appointment) => {
      if (appointment.sexe) {
        acc[appointment.sexe] = (acc[appointment.sexe] || 0) + 1;
      }
      return acc;
    }, {});
    
    const byLevel = appointments.reduce((acc, appointment) => {
      if (appointment.niveau_scolaire) {
        acc[appointment.niveau_scolaire] = (acc[appointment.niveau_scolaire] || 0) + 1;
      }
      return acc;
    }, {});
    
    return {
      total,
      confirmed: byStatus['confirmé'] || 0,
      pending: byStatus['en_attente'] || 0,
      cancelled: byStatus['annulé'] || 0,
      byGender,
      byLevel,
      confirmationRate: total > 0 ? Math.round((byStatus['confirmé'] || 0) / total * 100) : 0
    };
  }
}

module.exports = PDFGenerator;