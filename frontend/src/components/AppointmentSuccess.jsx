import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Home, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { downloadAppointmentPDF, previewAppointmentPDF } from '../utils/reactPdfGenerator';

const AppointmentSuccess = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Récupérer les détails du rendez-vous
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get(`/appointments/verify/${id}`);
        
        if (response.data.success) {
          setAppointment(response.data.appointment);
        } else {
          toast.error('لم يتم العثور على الموعد');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rendez-vous:', error);
        toast.error('خطأ في تحميل بيانات الموعد');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const generatePDF = async () => {
    if (!appointment) {
      toast.error('لا توجد بيانات للموعد');
      return;
    }

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
    if (!appointment) {
      toast.error('لا توجد بيانات للموعد');
      return;
    }

    try {
      await previewAppointmentPDF(appointment);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation du PDF:', error);
      toast.error('خطأ في معاينة ملف PDF');
    }
  };

  if (fetchLoading) {
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

  if (!appointment) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="alert alert-danger text-center">
              <h4>خطأ</h4>
              <p>لم يتم العثور على الموعد</p>
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
              <CheckCircle size={64} className="mb-3" />
              <h3 className="mb-2">تم حجز الموعد بنجاح!</h3>
              <p className="mb-0">رقم المرجع: {appointment.id}</p>
            </div>
            
            <div className="card-body p-4">
              {/* معلومات الموعد */}
              <div className="section-title mb-4">
                <h5 className="text-success text-center">موعدك محجوز بنجاح</h5>
                <hr />
              </div>

              {/* تفاصيل سريعة */}
              <div className="appointment-summary mb-4">
                <div className="row text-center">
                  <div className="col-md-4 mb-3">
                    <div className="summary-card p-3 border rounded">
                      <Calendar className="text-primary mb-2" size={32} />
                      <h6>التاريخ</h6>
                      <p className="mb-0 fw-bold">
                        {appointment.date_formatted || new Date(appointment.date_rdv).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="summary-card p-3 border rounded">
                      <CheckCircle className="text-success mb-2" size={32} />
                      <h6>الوقت</h6>
                      <p className="mb-0 fw-bold">
                        {appointment.heure_formatted || appointment.heure_rdv?.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="summary-card p-3 border rounded">
                      <CheckCircle className="text-success mb-2" size={32} />
                      <h6>الطالب</h6>
                      <p className="mb-0 fw-bold">
                        {appointment.prenom} {appointment.nom}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* الإجراءات */}
              <div className="actions text-center mb-4">
                <button
                  onClick={generatePDF}
                  className="btn btn-primary btn-lg me-3 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner ms-2" style={{width: '20px', height: '20px'}}></div>
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Download className="ms-2" size={20} />
                      تحميل PDF
                    </>
                  )}
                </button>
                
                <button
                  onClick={previewPDF}
                  className="btn btn-outline-primary btn-lg me-3 mb-3"
                  disabled={loading}
                >
                  👁️ معاينة PDF
                </button>
                
                <Link to="/appointment" className="btn btn-outline-success btn-lg me-3 mb-3">
                  <Calendar className="ms-2" size={20} />
                  حجز موعد آخر
                </Link>
                
                <Link to="/" className="btn btn-secondary btn-lg mb-3">
                  <Home className="ms-2" size={20} />
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
                    <div className="text-primary mb-1">📞</div>
                    <p className="mb-0 small">+212 5XX XX XX XX</p>
                  </div>
                  <div className="col-md-4">
                    <div className="text-primary mb-1">📍</div>
                    <p className="mb-0 small">تالمست، المغرب</p>
                  </div>
                  <div className="col-md-4">
                    <div className="text-primary mb-1">✉️</div>
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

export default AppointmentSuccess;