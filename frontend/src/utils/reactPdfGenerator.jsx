// utils/reactPdfGenerator.jsx - VERSION CORRIGÉE
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf,
  Font
} from '@react-pdf/renderer';

// ✅ Enregistrer une police qui supporte l'arabe
Font.register({
  family: 'Amiri',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf',
      fontWeight: 'normal'
    },
    {
      src: 'https://fonts.gstatic.com/s/amiri/v27/J7aTnpd8CGxBHqUpvq687oNL5jQ.ttf',
      fontWeight: 'bold'
    }
  ]
});

// ✅ Styles corrigés avec la nouvelle police
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Amiri', // ✅ Utiliser la police arabe
    textAlign: 'right', // ✅ Alignement RTL
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
    textAlign: 'center',
  },
  schoolNameFr: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
  },
  reference: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#eff6ff',
    padding: 10,
    marginBottom: 20,
    color: '#2563eb',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse', // ✅ RTL pour les lignes
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  infoLabel: {
    width: '40%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
  },
  infoValue: {
    width: '60%',
    fontSize: 11,
    color: '#1f2937',
    textAlign: 'right',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#eff6ff',
    padding: 15,
    marginVertical: 10,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 10,
    textAlign: 'right',
  },
  instructionItem: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 5,
    paddingRight: 10, // ✅ Padding à droite pour RTL
    textAlign: 'right',
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f1f5f9',
    padding: 10,
    marginTop: 20,
  },
  contactItem: {
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  notes: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginVertical: 10,
    fontSize: 10,
    color: '#374151',
    textAlign: 'right',
  }
});

// ✅ Composant corrigé avec meilleur support RTL
const AppointmentPDF = ({ appointment }) => {
  const getStatusInArabic = (statut) => {
    const statusMap = {
      'confirmé': 'مؤكد',
      'en_attente': 'في الانتظار',
      'annulé': 'ملغى'
    };
    return statusMap[statut] || statut;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>الثانوية التأهيلية تالمست</Text>
          <Text style={styles.schoolNameFr}>Lycée Qualifiant Talmest</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>تأكيد موعد التسجيل</Text>
        <Text style={styles.subtitle}>Confirmation de Rendez-vous</Text>

        {/* Numéro de référence */}
        <Text style={styles.reference}>رقم المرجع: {appointment.id}</Text>

        {/* Détails du rendez-vous */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>التاريخ</Text>
            <Text style={styles.detailValue}>
              {appointment.date_formatted || formatDate(appointment.date_rdv)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الوقت</Text>
            <Text style={styles.detailValue}>
              {appointment.heure_formatted || formatTime(appointment.heure_rdv)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الحالة</Text>
            <Text style={styles.detailValue}>
              {getStatusInArabic(appointment.statut)}
            </Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الطالب</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{appointment.prenom} {appointment.nom}</Text>
            <Text style={styles.infoLabel}>:الاسم الكامل</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{appointment.sexe}</Text>
            <Text style={styles.infoLabel}>:الجنس</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{appointment.telephone}</Text>
            <Text style={styles.infoLabel}>:رقم الهاتف</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{appointment.niveau_scolaire}</Text>
            <Text style={styles.infoLabel}>:المستوى الدراسي</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{appointment.adresse}</Text>
            <Text style={styles.infoLabel}>:العنوان</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>تعليمات مهمة</Text>
          <Text style={styles.instructionItem}>• يرجى الحضور قبل 15 دقيقة من موعدك المحدد</Text>
          <Text style={styles.instructionItem}>• إحضار جميع الوثائق المطلوبة للتسجيل</Text>
          <Text style={styles.instructionItem}>• بطاقة التعريف الوطنية أو جواز السفر</Text>
          <Text style={styles.instructionItem}>• شهادة الباكالوريا أو ما يعادلها</Text>
          <Text style={styles.instructionItem}>• صور شمسية حديثة</Text>
          <Text style={styles.instructionItem}>• شهادة طبية إن أمكن</Text>
          <Text style={styles.instructionItem}>• في حالة عدم التمكن من الحضور يرجى إبلاغ الإدارة مسبقاً</Text>
        </View>

        {/* Notes additionnelles */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملاحظات إضافية</Text>
            <Text style={styles.notes}>{appointment.notes}</Text>
          </View>
        )}

        {/* Contact */}
        <View style={styles.contact}>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>+212 5XX XX XX XX</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>contact@lycee-talmest.ma</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>تالمست، المغرب</Text>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          وثيقة مُنشأة بتاريخ: {new Date().toLocaleString('ar-SA')}
        </Text>
      </Page>
    </Document>
  );
};

// ✅ Reste du code identique...
const DailyExportPDF = ({ appointmentsData }) => {
  // Même correction pour l'export quotidien
  const getStatusInArabic = (statut) => {
    const statusMap = {
      'confirmé': 'مؤكد',
      'en_attente': 'في الانتظار',
      'annulé': 'ملغى'
    };
    return statusMap[statut] || statut;
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>الثانوية التأهيلية تالمست</Text>
          <Text style={styles.title}>قائمة المواعيد - {appointmentsData.date_formatted}</Text>
        </View>

        {/* Statistiques */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>المجموع</Text>
            <Text style={styles.detailValue}>{appointmentsData.total || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>مؤكد</Text>
            <Text style={styles.detailValue}>{appointmentsData.statistics?.confirmed || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>في الانتظار</Text>
            <Text style={styles.detailValue}>{appointmentsData.statistics?.pending || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ملغى</Text>
            <Text style={styles.detailValue}>{appointmentsData.statistics?.cancelled || 0}</Text>
          </View>
        </View>

        {/* Liste des rendez-vous */}
        {appointmentsData.appointments && appointmentsData.appointments.length > 0 ? (
          <View style={styles.section}>
            {/* En-tête du tableau */}
            <View style={[styles.infoRow, { backgroundColor: '#f3f4f6', padding: 8, fontWeight: 'bold' }]}>
              <Text style={{ width: '10%', fontSize: 10, textAlign: 'center' }}>الحالة</Text>
              <Text style={{ width: '25%', fontSize: 10, textAlign: 'center' }}>المستوى</Text>
              <Text style={{ width: '15%', fontSize: 10, textAlign: 'center' }}>الهاتف</Text>
              <Text style={{ width: '8%', fontSize: 10, textAlign: 'center' }}>الجنس</Text>
              <Text style={{ width: '25%', fontSize: 10, textAlign: 'center' }}>الاسم</Text>
              <Text style={{ width: '12%', fontSize: 10, textAlign: 'center' }}>الوقت</Text>
            </View>
            
            {appointmentsData.appointments.map((appointment, index) => (
              <View key={index} style={[styles.infoRow, { 
                borderBottom: 1, 
                borderBottomColor: '#e5e7eb', 
                paddingVertical: 5 
              }]}>
                <Text style={{ width: '10%', fontSize: 9, textAlign: 'center' }}>
                  {getStatusInArabic(appointment.statut)}
                </Text>
                <Text style={{ width: '25%', fontSize: 8, textAlign: 'center' }}>
                  {appointment.niveau_scolaire}
                </Text>
                <Text style={{ width: '15%', fontSize: 9, textAlign: 'center' }}>
                  {appointment.telephone}
                </Text>
                <Text style={{ width: '8%', fontSize: 9, textAlign: 'center' }}>
                  {appointment.sexe}
                </Text>
                <Text style={{ width: '25%', fontSize: 9, textAlign: 'center' }}>
                  {appointment.prenom} {appointment.nom}
                </Text>
                <Text style={{ width: '12%', fontSize: 9, textAlign: 'center' }}>
                  {appointment.heure_formatted || appointment.heure_rdv}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ textAlign: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              لا توجد مواعيد لهذا اليوم
            </Text>
          </View>
        )}

        {/* Pied de page */}
        <Text style={styles.footer}>
          تاريخ التصدير: {new Date().toLocaleString('ar-SA')}
        </Text>
      </Page>
    </Document>
  );
};

// Fonctions utilitaires restent identiques
export const downloadAppointmentPDF = async (appointment) => {
  try {
    const blob = await pdf(<AppointmentPDF appointment={appointment} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تأكيد-موعد-${appointment.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('خطأ في إنشاء ملف PDF');
  }
};

export const downloadDailyExportPDF = async (appointmentsData) => {
  try {
    const blob = await pdf(<DailyExportPDF appointmentsData={appointmentsData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `مواعيد-${appointmentsData.date_formatted || 'export'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF d\'export:', error);
    throw new Error('خطأ في تصدير ملف PDF');
  }
};

export const previewAppointmentPDF = async (appointment) => {
  try {
    const blob = await pdf(<AppointmentPDF appointment={appointment} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Erreur lors de la prévisualisation du PDF:', error);
    throw new Error('خطأ في معاينة ملف PDF');
  }
};

export default {
  downloadAppointmentPDF,
  downloadDailyExportPDF,
  previewAppointmentPDF,
  AppointmentPDF,
  DailyExportPDF
};