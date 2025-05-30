// components/AppointmentPreview.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Phone, MapPin, GraduationCap, 
  CheckCircle, ArrowLeft, Edit 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const AppointmentPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const appointmentData = location.state?.appointmentData;

  // Si pas de données, rediriger vers le formulaire
  if (!appointmentData) {
    navigate('/appointment');
    return null;
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/appointments', appointmentData);
      
      if (response.data.success) {
        toast.success('تم حجز الموعد بنجاح!');
        // Rediriger vers la page de succès avec l'ID
        navigate(`/confirmation/${response.data.appointment.id}`);
      } else {
        toast.error(response.data.message || 'خطأ في حجز الموعد');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 409) {
        toast.error('هذا الموعد غير متاح. يرجى اختيار موعد آخر');
      } else {
        toast.error('خطأ في حجز الموعد. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Retourner au formulaire avec les données pré-remplies
    navigate('/appointment', { 
      state: { editData: appointmentData } 
    });
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header bg-warning text-dark text-center py-4">
              <Edit size={48} className="mb-3" />
              <h3 className="mb-2">تأكيد بيانات الموعد</h3>
              <p className="mb-0">يرجى مراجعة البيانات قبل التأكيد النهائي</p>
            </div>
            
            <div className="card-body p-4">
              {/* بيانات الطالب */}
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
                    <strong>الاسم العائلي:</strong>
                    <p className="mb-0">{appointmentData.nom}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <strong>الاسم الشخصي:</strong>
                    <p className="mb-0">{appointmentData.prenom}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <Phone className="text-primary ms-1" size={16} />
                    <strong>رقم الهاتف:</strong>
                    <p className="mb-0">{appointmentData.telephone}</p>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="info-item">
                    <strong>الجنس:</strong>
                    <p className="mb-0">{appointmentData.sexe}</p>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="info-item">
                    <MapPin className="text-primary ms-1" size={16} />
                    <strong>العنوان:</strong>
                    <p className="mb-0">{appointmentData.adresse}</p>
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="info-item">
                    <GraduationCap className="text-primary ms-1" size={16} />
                    <strong>المستوى الدراسي:</strong>
                    <p className="mb-0">{appointmentData.niveau_scolaire}</p>
                  </div>
                </div>
              </div>

              {/* تفاصيل الموعد */}
              <div className="section-title mb-4">
                <h5 className="text-primary">
                  <Calendar className="ms-2" size={20} />
                  تفاصيل الموعد
                </h5>
                <hr />
              </div>

              <div className="appointment-details mb-4">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="detail-card text-center p-3 border rounded">
                      <Calendar className="text-primary mb-2" size={32} />
                      <h6>التاريخ</h6>
                      <p className="mb-0 fw-bold">
                        {new Date(appointmentData.date_rdv).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="detail-card text-center p-3 border rounded">
                      <Clock className="text-primary mb-2" size={32} />
                      <h6>الوقت</h6>
                      <p className="mb-0 fw-bold">
                        {appointmentData.heure_rdv.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* تنبيه */}
              <div className="alert alert-info mb-4">
                <h6 className="alert-heading">انتباه:</h6>
                <p className="mb-0">
                  بعد النقر على "تأكيد الحجز"، سيتم حفظ موعدك نهائياً في النظام. 
                  تأكد من صحة جميع البيانات قبل المتابعة.
                </p>
              </div>

              {/* أزرار الإجراءات */}
              <div className="actions text-center">
                <button
                  onClick={handleConfirm}
                  className="btn btn-success btn-lg me-3 mb-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner ms-2" style={{width: '20px', height: '20px'}}></div>
                      جاري التأكيد...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="ms-2" size={20} />
                      تأكيد الحجز نهائياً
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleEdit}
                  className="btn btn-outline-primary btn-lg mb-2"
                  disabled={loading}
                >
                  <ArrowLeft className="ms-2" size={20} />
                  تعديل البيانات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPreview;