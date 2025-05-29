import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Phone, MapPin, GraduationCap, Download, Home, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { downloadAppointmentPDF, previewAppointmentPDF } from '../utils/pdfArabicGenerator';

const AppointmentConfirmation = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/verify/${id}`);
      
      if (response.data.success) {
        setAppointment(response.data.appointment);
      } else {
        setError('لم يتم العثور على الموعد');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du rendez-vous:', error);
      setError('خطأ في تحميل بيانات الموعد');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id, fetchAppointmentDetails]);

  const generatePDF = async () => {
    if (!appointment) return;

    try {
      setLoading(true);
      await downloadAppointmentPDF(appointment);
      toast.success('تم إنشاء ملف PDF بنجاح');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('خطأ في إنشاء ملف PDF');
    } finally {
      setLoading(false);
    }
  };

  const previewPDF = async () => {
    if (!appointment) return;

    try {
      await previewAppointmentPDF(appointment);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation du PDF:', error);
      toast.error('خطأ في معاينة ملف PDF');
    }
  }; 80;
      
      // Numéro de référence
      doc.setFont('helvetica', 'bold');
      doc.text(`Référence / المرجع: ${appointment.id}`, 20, yPos);
      yPos += 15;
      
      // Nom complet
      doc.text(`Nom / الاسم: ${appointment.prenom} ${appointment.nom}`, 20, yPos);
      yPos += 10;
      
      // Sexe
      doc.text(`Sexe / الجنس: ${appointment.sexe}`, 20, yPos);
      yPos += 10;
      
      // Téléphone
      doc.text(`Téléphone / الهاتف: ${appointment.telephone}`, 20, yPos);
      yPos += 10;
      
      // Niveau scolaire
      doc.text(`Niveau / المستوى: ${appointment.niveau_scolaire}`, 20, yPos);
      yPos += 15;
      
      // Date et heure du rendez-vous
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('معلومات الموعد - Informations du rendez-vous', 20, yPos);
      yPos += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Date / التاريخ: ${appointment.date_formatted}`, 20, yPos);
      yPos += 10;
      
      doc.text(`Heure / الوقت: ${appointment.heure_formatted}`, 20, yPos);
      yPos += 10;
      
      doc.text(`Statut / الحالة: ${appointment.statut}`, 20, yPos);
      yPos += 20;
      
      // Instructions
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions importantes / تعليمات مهمة:', 20, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.text('• يرجى الحضور قبل 15 دقيقة من موعدك', 20, yPos);
      yPos += 8;
      doc.text('• إحضار جميع الوثائق المطلوبة', 20, yPos);
      yPos += 8;
      doc.text('• بطاقة التعريف الوطنية', 20, yPos);
      yPos += 8;
      doc.text('• شهادة الباكالوريا أو ما يعادلها', 20, yPos);
      yPos += 8;
      doc.text('• صور شمسية حديثة', 20, yPos);
      yPos += 15;
      
      // Contact
      doc.setFont('helvetica', 'bold');
      doc.text('Contact / اتصال:', 20, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.text('Téléphone: +212 5XX XX XX XX', 20, yPos);
      yPos += 8;
      doc.text('Email: contact@lycee-talmest.ma', 20, yPos);
      yPos += 8;
      doc.text('Adresse: تالمست، المغرب', 20, yPos);
      
      // Pied de page
      doc.setFontSize(10);
      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 280, { align: 'center' });
      
      // Sauvegarder le PDF
      doc.save(`rendez-vous-${appointment.id}-${appointment.nom}.pdf`);
      
      toast.success('تم إنشاء ملف PDF بنجاح');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('خطأ في إنشاء ملف PDF');
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'confirmé': 'bg-success',
      'en_attente': 'bg-warning',
      'annulé': 'bg-danger'
    };
    
    const labels = {
      'confirmé': 'مؤكد',
      'en_attente': 'في الانتظار',
      'annulé': 'ملغى'
    };
    
    return (
      <span className={`badge ${badges[statut] || 'bg-secondary'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto text-center">
            <div className="loading-spinner mx-auto mb-3"></div>
            <p>جاري تحميل بيانات الموعد...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="alert alert-danger text-center">
              <h4>خطأ</h4>
              <p>{error || 'لم يتم العثور على الموعد'}</p>
              <Link to="/" className="btn btn-primary">
                <Home className="ms-2" size={16} />
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header bg-success text-white text-center py-4">
              <CheckCircle size={48} className="mb-3" />
              <h3 className="mb-2">تم تأكيد حجز الموعد بنجاح!</h3>
              <p className="mb-0">رقم المرجع: {appointment.id}</p>
            </div>
            
            <div className="card-body p-4">
              {/* معلومات الطالب */}
              <div className="section-title mb-4">
                <h5 className="text-primary">
                  <User className="ms-2" size={20} />
                  بيانات الطالب
                </h5>
                <hr />
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <strong>الاسم الكامل:</strong>
                    <p className="mb-0">{appointment.prenom} {appointment.nom}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <strong>الجنس:</strong>
                    <p className="mb-0">{appointment.sexe}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <Phone className="text-primary ms-1" size={16} />
                    <strong>رقم الهاتف:</strong>
                    <p className="mb-0">{appointment.telephone}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <GraduationCap className="text-primary ms-1" size={16} />
                    <strong>المستوى الدراسي:</strong>
                    <p className="mb-0">{appointment.niveau_scolaire}</p>
                  </div>
                </div>
              </div>

              {/* معلومات الموعد */}
              <div className="section-title mb-4">
                <h5 className="text-primary">
                  <Calendar className="ms-2" size={20} />
                  تفاصيل الموعد
                </h5>
                <hr />
              </div>

              <div className="appointment-details mb-4">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="detail-card text-center p-3 border rounded">
                      <Calendar className="text-primary mb-2" size={32} />
                      <h6>التاريخ</h6>
                      <p className="mb-0 fw-bold">{appointment.date_formatted}</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="detail-card text-center p-3 border rounded">
                      <Clock className="text-primary mb-2" size={32} />
                      <h6>الوقت</h6>
                      <p className="mb-0 fw-bold">{appointment.heure_formatted}</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="detail-card text-center p-3 border rounded">
                      <CheckCircle className="text-success mb-2" size={32} />
                      <h6>الحالة</h6>
                      <p className="mb-0">{getStatusBadge(appointment.statut)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* الإجراءات */}
              <div className="actions text-center mb-4">
                <button
                  onClick={generatePDF}
                  className="btn btn-primary me-3 mb-2"
                >
                  <Download className="ms-2" size={16} />
                  تحميل PDF
                </button>
                
                <Link
                  to="/appointment"
                  className="btn btn-secondary me-3 mb-2"
                >
                  <Calendar className="ms-2" size={16} />
                  حجز موعد آخر
                </Link>
                
                <Link
                  to="/"
                  className="btn btn-outline-primary mb-2"
                >
                  <Home className="ms-2" size={16} />
                  العودة للرئيسية
                </Link>
              </div>

              {/* معلومات مهمة */}
              <div className="alert alert-info">
                <h6 className="alert-heading">معلومات مهمة:</h6>
                <ul className="mb-0">
                  <li>يرجى الحضور قبل 15 دقيقة من موعدك المحدد</li>
                  <li>إحضار جميع الوثائق المطلوبة للتسجيل</li>
                  <li>في حالة عدم التمكن من الحضور، يرجى إبلاغ الإدارة مسبقاً</li>
                  <li>الاحتفاظ برقم المرجع ({appointment.id}) للمراجعة</li>
                </ul>
              </div>

              {/* معلومات الاتصال */}
              <div className="contact-info mt-4 p-3 bg-light rounded">
                <h6 className="text-center mb-3">للاستفسار أو المساعدة:</h6>
                <div className="row text-center">
                  <div className="col-md-4">
                    <Phone className="text-primary mb-1" size={20} />
                    <p className="mb-0 small">+212 5XX XX XX XX</p>
                  </div>
                  <div className="col-md-4">
                    <MapPin className="text-primary mb-1" size={20} />
                    <p className="mb-0 small">تالمست، المغرب</p>
                  </div>
                  <div className="col-md-4">
                    <div className="text-primary mb-1">@</div>
                    <p className="mb-0 small">contact@lycee-talmest.ma</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;