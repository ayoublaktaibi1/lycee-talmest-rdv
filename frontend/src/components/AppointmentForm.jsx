import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Phone, GraduationCap, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: '',
    adresse: '',
    telephone: '',
    niveau_scolaire: ''
  });

  const niveauxScolaires = [
    'الجذع المشترك العلمي',
    'الجذع المشترك الأدبي', 
    'السنة الأولى باكالوريا علوم رياضية',
    'السنة الأولى باكالوريا علوم تجريبية',
    'السنة الأولى باكالوريا آداب وعلوم إنسانية',
    'السنة الثانية باكالوريا علوم رياضية',
    'السنة الثانية باكالوريا علوم فيزيائية',
    'السنة الثانية باكالوريا علوم الحياة والأرض',
    'السنة الثانية باكالوريا آداب وعلوم إنسانية'
  ];

  // Charger les dates disponibles au montage du composant
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Charger les créneaux disponibles quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/available-dates');
      setAvailableDates(response.data.dates);
    } catch (error) {
      console.error('Erreur lors du chargement des dates:', error);
      toast.error('خطأ في تحميل التواريخ المتاحة');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/available-slots/${date}`);
      setAvailableSlots(response.data.slots);
      setSelectedTime(''); // Reset selected time when date changes
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      toast.error('خطأ في تحميل الأوقات المتاحة');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const validateForm = () => {
    const requiredFields = ['nom', 'prenom', 'sexe', 'adresse', 'telephone', 'niveau_scolaire'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!selectedDate) {
      toast.error('يرجى اختيار تاريخ الموعد');
      return false;
    }

    if (!selectedTime) {
      toast.error('يرجى اختيار وقت الموعد');
      return false;
    }

    // Validation du numéro de téléphone (format marocain)
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      toast.error('يرجى إدخال رقم هاتف صحيح');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        ...formData,
        date_rdv: selectedDate,
        heure_rdv: selectedTime
      };

      const response = await api.post('/appointments', appointmentData);
      
      if (response.data.success) {
        toast.success('تم حجز الموعد بنجاح!');
        navigate(`/confirmation/${response.data.appointment.id}`);
      } else {
        toast.error(response.data.message || 'خطأ في حجز الموعد');
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      if (error.response?.status === 409) {
        toast.error('هذا الموعد غير متاح. يرجى اختيار موعد آخر');
        fetchAvailableSlots(selectedDate); // Refresh slots
      } else {
        toast.error('خطأ في حجز الموعد. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-0">
                <Calendar className="ms-2" size={24} />
                حجز موعد جديد
              </h3>
              <p className="mb-0 mt-2 opacity-90">املأ البيانات أدناه لحجز موعدك</p>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* بيانات الطالب */}
                <div className="section-title mb-4">
                  <h5 className="text-primary">
                    <User className="ms-2" size={20} />
                    بيانات الطالب
                  </h5>
                  <hr />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">الاسم العائلي *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      placeholder="أدخل الاسم العائلي"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">الاسم الشخصي *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      placeholder="أدخل الاسم الشخصي"
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">الجنس *</label>
                    <select
                      className="form-select"
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">رقم الهاتف *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="0612345678"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">العنوان *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <MapPin size={16} />
                    </span>
                    <textarea
                      className="form-control"
                      name="adresse"
                      rows="3"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="أدخل العنوان الكامل"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">المستوى الدراسي *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <GraduationCap size={16} />
                    </span>
                    <select
                      className="form-select"
                      name="niveau_scolaire"
                      value={formData.niveau_scolaire}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">اختر المستوى الدراسي</option>
                      {niveauxScolaires.map((niveau, index) => (
                        <option key={index} value={niveau}>
                          {niveau}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* اختيار التاريخ */}
                <div className="section-title mb-4">
                  <h5 className="text-primary">
                    <Calendar className="ms-2" size={20} />
                    اختيار التاريخ
                  </h5>
                  <hr />
                </div>

                {loading && availableDates.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto"></div>
                    <p className="mt-2">جاري تحميل التواريخ المتاحة...</p>
                  </div>
                ) : (
                  <div className="date-grid mb-4">
                    {availableDates.map((date) => (
                      <div
                        key={date.date}
                        className={`date-item ${selectedDate === date.date ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date.date)}
                      >
                        <div className="fw-bold">{date.formatted}</div>
                        <div className="text-sm opacity-75">{date.dayName}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* اختيار الوقت */}
                {selectedDate && (
                  <>
                    <div className="section-title mb-4">
                      <h5 className="text-primary">
                        <Clock className="ms-2" size={20} />
                        اختيار الوقت
                      </h5>
                      <hr />
                    </div>

                    {loading && availableSlots.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="loading-spinner mx-auto"></div>
                        <p className="mt-2">جاري تحميل الأوقات المتاحة...</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="alert alert-warning text-center">
                        <Clock size={24} className="mb-2" />
                        <p className="mb-0">لا توجد أوقات متاحة لهذا اليوم</p>
                      </div>
                    ) : (
                      <div className="time-slots-grid mb-4">
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`time-slot ${selectedTime === slot.time ? 'selected' : ''}`}
                            onClick={() => handleTimeSelect(slot.time)}
                          >
                            {slot.formatted}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* زر الإرسال */}
                <div className="text-center mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner ms-2" style={{width: '20px', height: '20px'}}></div>
                        جاري الحجز...
                      </>
                    ) : (
                      <>
                        <Send className="ms-2" size={20} />
                        تأكيد الحجز
                      </>
                    )}
                  </button>
                </div>

                <div className="alert alert-info mt-4">
                  <strong>ملاحظة مهمة:</strong>
                  <ul className="mb-0 mt-2">
                    <li>يرجى الحضور قبل 15 دقيقة من موعدك</li>
                    <li>إحضار جميع الوثائق المطلوبة</li>
                    <li>في حالة عدم التمكن من الحضور، يرجى الإلغاء مسبقاً</li>
                  </ul>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;