import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration des polices pour pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Ajouter une police arabe (nous utiliserons une police système disponible)
pdfMake.fonts = {
  // Police par défaut
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  // Police pour l'arabe - utiliser une police système
  Arabic: {
    normal: 'Arial',
    bold: 'Arial',
    italics: 'Arial',
    bolditalics: 'Arial'
  }
};

// Fonction pour générer le PDF de confirmation de rendez-vous
export const generateAppointmentPDF = (appointment) => {
  if (!appointment) {
    throw new Error('Données de rendez-vous manquantes');
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: {
      font: 'Arabic',
      fontSize: 11,
      alignment: 'right'
    },
    
    content: [
      // En-tête
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: 'الثانوية التأهيلية تالمست',
                style: 'header',
                alignment: 'center'
              },
              {
                text: 'Lycée Qualifiant Talmest',
                style: 'subheader',
                alignment: 'center'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Titre du document
      {
        text: 'تأكيد موعد التسجيل',
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'Confirmation de Rendez-vous',
        style: 'subtitle',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      // Ligne de séparation
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 2,
            lineColor: '#2563eb'
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Numéro de référence
      {
        columns: [
          {
            width: '*',
            text: `رقم المرجع: ${appointment.id}`,
            style: 'reference',
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Informations du rendez-vous
      {
        text: 'معلومات الموعد',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10]
      },
      
      // Table des informations principales
      {
        table: {
          widths: ['30%', '*'],
          body: [
            [
              { text: 'التاريخ:', style: 'tableLabel' },
              { text: appointment.date_formatted || appointment.date_rdv, style: 'tableValue' }
            ],
            [
              { text: 'الوقت:', style: 'tableLabel' },
              { text: appointment.heure_formatted || appointment.heure_rdv, style: 'tableValue' }
            ],
            [
              { text: 'الحالة:', style: 'tableLabel' },
              { text: getStatusInArabic(appointment.statut), style: 'tableValue' }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i, node) {
            return i === 0 || i === node.table.body.length ? 2 : 1;
          },
          vLineWidth: function(i, node) {
            return i === 0 || i === node.table.widths.length ? 2 : 1;
          },
          hLineColor: function(i, node) {
            return '#e5e7eb';
          },
          vLineColor: function(i, node) {
            return '#e5e7eb';
          }
        },
        margin: [0, 0, 0, 20]
      },
      
      // Informations personnelles
      {
        text: 'بيانات الطالب',
        style: 'sectionTitle',
        margin: [0, 20, 0, 10]
      },
      
      {
        table: {
          widths: ['30%', '*'],
          body: [
            [
              { text: 'الاسم الكامل:', style: 'tableLabel' },
              { text: `${appointment.prenom} ${appointment.nom}`, style: 'tableValue' }
            ],
            [
              { text: 'الجنس:', style: 'tableLabel' },
              { text: appointment.sexe, style: 'tableValue' }
            ],
            [
              { text: 'رقم الهاتف:', style: 'tableLabel' },
              { text: appointment.telephone, style: 'tableValue' }
            ],
            [
              { text: 'المستوى الدراسي:', style: 'tableLabel' },
              { text: appointment.niveau_scolaire, style: 'tableValue' }
            ],
            [
              { text: 'العنوان:', style: 'tableLabel' },
              { text: appointment.adresse, style: 'tableValue' }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i, node) {
            return i === 0 || i === node.table.body.length ? 2 : 1;
          },
          vLineWidth: function(i, node) {
            return i === 0 || i === node.table.widths.length ? 2 : 1;
          },
          hLineColor: function(i, node) {
            return '#e5e7eb';
          },
          vLineColor: function(i, node) {
            return '#e5e7eb';
          }
        },
        margin: [0, 0, 0, 30]
      },
      
      // Instructions importantes
      {
        text: 'تعليمات مهمة',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10]
      },
      
      {
        ul: [
          'يرجى الحضور قبل 15 دقيقة من موعدك المحدد',
          'إحضار جميع الوثائق المطلوبة للتسجيل',
          'بطاقة التعريف الوطنية أو جواز السفر',
          'شهادة الباكالوريا أو ما يعادلها',
          'صور شمسية حديثة (4 صور)',
          'شهادة طبية (إن أمكن)',
          'في حالة عدم التمكن من الحضور، يرجى إبلاغ الإدارة مسبقاً'
        ],
        style: 'instructionsList',
        margin: [0, 0, 0, 30]
      },
      
      // Informations de contact
      {
        text: 'معلومات الاتصال',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10]
      },
      
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: [
                  { text: '📞 ', fontSize: 14 },
                  { text: '+212 5XX XX XX XX' }
                ],
                alignment: 'center',
                style: 'contactInfo'
              },
              {
                text: [
                  { text: '✉️ ', fontSize: 14 },
                  { text: 'contact@lycee-talmest.ma' }
                ],
                alignment: 'center',
                style: 'contactInfo'
              },
              {
                text: [
                  { text: '📍 ', fontSize: 14 },
                  { text: 'تالمست، المغرب' }
                ],
                alignment: 'center',
                style: 'contactInfo'
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 30]
      },
      
      // Notes additionnelles si présentes
      ...(appointment.notes ? [
        {
          text: 'ملاحظات إضافية',
          style: 'sectionTitle',
          margin: [0, 0, 0, 10]
        },
        {
          text: appointment.notes,
          style: 'notes',
          margin: [0, 0, 0, 30]
        }
      ] : []),
      
      // Pied de page
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: 'وثيقة مُنشأة إلكترونياً',
                style: 'footer',
                alignment: 'center'
              },
              {
                text: `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}`,
                style: 'footer',
                alignment: 'center'
              }
            ]
          }
        ],
        margin: [0, 30, 0, 0]
      }
    ],
    
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#2563eb',
        margin: [0, 0, 0, 5]
      },
      subheader: {
        fontSize: 14,
        color: '#6b7280',
        italics: true
      },
      title: {
        fontSize: 20,
        bold: true,
        color: '#1f2937'
      },
      subtitle: {
        fontSize: 14,
        color: '#6b7280',
        italics: true
      },
      reference: {
        fontSize: 16,
        bold: true,
        color: '#2563eb',
        background: '#eff6ff',
        margin: [10, 10, 10, 10]
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: '#2563eb',
        margin: [0, 10, 0, 5]
      },
      tableLabel: {
        fontSize: 11,
        bold: true,
        color: '#374151',
        alignment: 'right',
        margin: [5, 8, 5, 8]
      },
      tableValue: {
        fontSize: 11,
        color: '#1f2937',
        alignment: 'right',
        margin: [5, 8, 5, 8]
      },
      instructionsList: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.4
      },
      contactInfo: {
        fontSize: 10,
        color: '#6b7280'
      },
      notes: {
        fontSize: 10,
        color: '#374151',
        background: '#f9fafb',
        margin: [10, 10, 10, 10]
      },
      footer: {
        fontSize: 9,
        color: '#9ca3af',
        italics: true
      }
    }
  };

  return docDefinition;
};

// Fonction pour générer le PDF d'export quotidien
export const generateDailyExportPDF = (appointmentsData) => {
  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: {
      font: 'Arabic',
      fontSize: 10,
      alignment: 'right'
    },
    
    content: [
      // En-tête
      {
        text: 'الثانوية التأهيلية تالمست',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      {
        text: `قائمة المواعيد - ${appointmentsData.date_formatted}`,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // Statistiques
      {
        columns: [
          {
            width: '25%',
            text: `إجمالي المواعيد: ${appointmentsData.total || appointmentsData.appointments?.length || 0}`,
            style: 'statItem',
            alignment: 'center'
          },
          {
            width: '25%',
            text: `مؤكد: ${appointmentsData.statistics?.confirmed || 0}`,
            style: 'statItem',
            alignment: 'center'
          },
          {
            width: '25%',
            text: `في الانتظار: ${appointmentsData.statistics?.pending || 0}`,
            style: 'statItem',
            alignment: 'center'
          },
          {
            width: '25%',
            text: `ملغى: ${appointmentsData.statistics?.cancelled || 0}`,
            style: 'statItem',
            alignment: 'center'
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Table des rendez-vous
      ...(appointmentsData.appointments && appointmentsData.appointments.length > 0 ? [
        {
          table: {
            headerRows: 1,
            widths: ['8%', '18%', '6%', '12%', '25%', '18%', '8%'],
            body: [
              // En-tête du tableau
              [
                { text: 'الوقت', style: 'tableHeader' },
                { text: 'الاسم الكامل', style: 'tableHeader' },
                { text: 'الجنس', style: 'tableHeader' },
                { text: 'الهاتف', style: 'tableHeader' },
                { text: 'المستوى الدراسي', style: 'tableHeader' },
                { text: 'العنوان', style: 'tableHeader' },
                { text: 'الحالة', style: 'tableHeader' }
              ],
              // Données
              ...appointmentsData.appointments.map(appointment => [
                { text: appointment.heure_formatted || appointment.heure_rdv, style: 'tableCell' },
                { text: `${appointment.prenom} ${appointment.nom}`, style: 'tableCell' },
                { text: appointment.sexe, style: 'tableCell' },
                { text: appointment.telephone, style: 'tableCell' },
                { text: appointment.niveau_scolaire, style: 'tableCellSmall' },
                { text: appointment.adresse, style: 'tableCellSmall' },
                { text: getStatusInArabic(appointment.statut), style: 'tableCell' }
              ])
            ]
          },
          layout: {
            hLineWidth: function(i, node) {
              return i === 0 || i === node.table.body.length ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return i === 0 || i === node.table.widths.length ? 2 : 1;
            },
            hLineColor: function(i, node) {
              return i === 1 ? '#2563eb' : '#e5e7eb';
            },
            vLineColor: function(i, node) {
              return '#e5e7eb';
            },
            fillColor: function(i, node) {
              return i === 0 ? '#f8fafc' : null;
            }
          }
        }
      ] : [
        {
          text: 'لا توجد مواعيد لهذا اليوم',
          style: 'noData',
          alignment: 'center',
          margin: [0, 50, 0, 50]
        }
      ]),
      
      // Pied de page
      {
        columns: [
          {
            width: '*',
            text: `وثيقة مُنشأة بتاريخ: ${appointmentsData.exportedAt || new Date().toLocaleString('ar-SA')}`,
            style: 'footer',
            alignment: 'center'
          }
        ],
        margin: [0, 30, 0, 0]
      }
    ],
    
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        color: '#2563eb'
      },
      title: {
        fontSize: 14,
        bold: true,
        color: '#1f2937'
      },
      statItem: {
        fontSize: 11,
        bold: true,
        color: '#374151',
        background: '#f3f4f6',
        margin: [5, 5, 5, 5]
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#1f2937',
        alignment: 'center',
        margin: [3, 5, 3, 5]
      },
      tableCell: {
        fontSize: 9,
        color: '#374151',
        alignment: 'center',
        margin: [3, 4, 3, 4]
      },
      tableCellSmall: {
        fontSize: 8,
        color: '#374151',
        alignment: 'right',
        margin: [3, 4, 3, 4]
      },
      noData: {
        fontSize: 14,
        color: '#6b7280',
        italics: true
      },
      footer: {
        fontSize: 9,
        color: '#9ca3af',
        italics: true
      }
    }
  };

  return docDefinition;
};

// Fonction utilitaire pour convertir le statut en arabe
function getStatusInArabic(statut) {
  const statusMap = {
    'confirmé': 'مؤكد',
    'en_attente': 'في الانتظار',
    'annulé': 'ملغى',
    'confirmed': 'مؤكد',
    'pending': 'في الانتظار',
    'cancelled': 'ملغى'
  };
  return statusMap[statut] || statut;
}

// Fonction principale pour télécharger le PDF de rendez-vous
export const downloadAppointmentPDF = async (appointment) => {
  try {
    const docDefinition = generateAppointmentPDF(appointment);
    const fileName = `تأكيد-موعد-${appointment.id}-${appointment.nom}.pdf`;
    
    pdfMake.createPdf(docDefinition).download(fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('خطأ في إنشاء ملف PDF');
  }
};

// Fonction principale pour télécharger le PDF d'export quotidien
export const downloadDailyExportPDF = async (appointmentsData) => {
  try {
    const docDefinition = generateDailyExportPDF(appointmentsData);
    const fileName = `قائمة-المواعيد-${appointmentsData.date_formatted}.pdf`;
    
    pdfMake.createPdf(docDefinition).download(fileName);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF d\'export:', error);
    throw new Error('خطأ في تصدير ملف PDF');
  }
};

// Fonction pour prévisualiser le PDF (ouvre dans un nouvel onglet)
export const previewAppointmentPDF = async (appointment) => {
  try {
    const docDefinition = generateAppointmentPDF(appointment);
    pdfMake.createPdf(docDefinition).open();
    return true;
  } catch (error) {
    console.error('Erreur lors de la prévisualisation du PDF:', error);
    throw new Error('خطأ في معاينة ملف PDF');
  }
};

export default {
  generateAppointmentPDF,
  generateDailyExportPDF,
  downloadAppointmentPDF,
  downloadDailyExportPDF,
  previewAppointmentPDF
};