import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Calendar = ({ selectedDate, onDateSelect, selectedTime, onTimeSelect }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Charger les dates disponibles
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Charger les créneaux quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/available-dates');
      if (response.data.success) {
        setAvailableDates(response.data.dates);
      }
    } catch (error) {
      console.error('Erreur dates:', error);
      toast.error('خطأ في تحميل التواريخ');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/available-slots/${date}`);
      if (response.data.success) {
        setAvailableSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Erreur créneaux:', error);
      toast.error('خطأ في تحميل الأوقات');
    } finally {
      setLoading(false);
    }
  };

  // Générer le calendrier du mois
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today.setHours(0, 0, 0, 0);
      const isAvailable = availableDates.some(d => d.date === dateStr);
      const isSelected = selectedDate === dateStr;
      
      days.push({
        date: date,
        dateStr: dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isAvailable,
        isSelected,
        dayName: date.toLocaleDateString('ar', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const handleDateClick = (day) => {
    if (day.isPast || !day.isAvailable) return;
    onDateSelect(day.dateStr);
  };

  const handleTimeClick = (slot) => {
    onTimeSelect(slot.time);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="calendar-container">
      <div className="calendar-section">
        <div className="section-header">
          <h4 className="text-primary d-flex align-items-center">
            <CalendarIcon size={20} className="ms-2" />
            اختيار التاريخ
          </h4>
        </div>

        {/* Navigation du mois */}
        <div className="month-navigation d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronRight size={16} />
          </button>
          
          <h5 className="mb-0">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h5>
          
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigateMonth(1)}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Calendrier */}
        <div className="calendar-grid">
          {/* Jours de la semaine */}
          <div className="weekdays-header">
            {weekDays.map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Jours du mois */}
          <div className="calendar-days">
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${
                  day.isPast ? 'past' : ''
                } ${
                  day.isAvailable && !day.isPast ? 'available' : ''
                } ${
                  day.isSelected ? 'selected' : ''
                } ${
                  !day.isAvailable && !day.isPast && day.isCurrentMonth ? 'unavailable' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                <span className="day-number">{day.day}</span>
                {day.isAvailable && !day.isPast && (
                  <span className="availability-dot"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="calendar-legend mt-3">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>متاح</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot selected"></span>
            <span>محدد</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable"></span>
            <span>غير متاح</span>
          </div>
        </div>
      </div>

      {/* Créneaux horaires */}
      {selectedDate && (
        <div className="time-slots-section mt-4">
          <div className="section-header">
            <h4 className="text-primary d-flex align-items-center">
              <Clock size={20} className="ms-2" />
              الأوقات المتاحة
            </h4>
            <p className="text-muted mb-0">
              {availableDates.find(d => d.date === selectedDate)?.formatted}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="loading-spinner"></div>
              <p className="mt-2">جاري التحميل...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="alert alert-warning text-center">
              <Clock size={24} className="mb-2" />
              <p className="mb-0">لا توجد أوقات متاحة لهذا اليوم</p>
            </div>
          ) : (
            <div className="time-slots-grid">
              {availableSlots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  className={`time-slot-btn ${
                    selectedTime === slot.time ? 'selected' : ''
                  }`}
                  onClick={() => handleTimeClick(slot)}
                >
                  <Clock size={16} className="mb-1" />
                  <span>{slot.formatted}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .section-header {
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .month-navigation {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .calendar-grid {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .weekdays-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #2563eb;
          color: white;
        }

        .weekday-header {
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 60px;
        }

        .calendar-day.other-month {
          color: #cbd5e1;
          background: #f8fafc;
        }

        .calendar-day.past {
          color: #94a3b8;
          background: #f1f5f9;
          cursor: not-allowed;
        }

        .calendar-day.available:hover {
          background: #dbeafe;
          transform: scale(1.02);
        }

        .calendar-day.selected {
          background: #2563eb;
          color: white;
          font-weight: bold;
        }

        .calendar-day.unavailable {
          background: #fee2e2;
          color: #dc2626;
          cursor: not-allowed;
        }

        .day-number {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .availability-dot {
          width: 4px;
          height: 4px;
          background: #10b981;
          border-radius: 50%;
          position: absolute;
          bottom: 6px;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-dot.available {
          background: #10b981;
        }

        .legend-dot.selected {
          background: #2563eb;
        }

        .legend-dot.unavailable {
          background: #dc2626;
        }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .time-slot-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .time-slot-btn:hover {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.05);
          transform: translateY(-2px);
        }

        .time-slot-btn.selected {
          border-color: #2563eb;
          background: #2563eb;
          color: white;
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 1rem;
          }

          .weekday-header {
            padding: 0.5rem 0.25rem;
            font-size: 0.75rem;
          }

          .calendar-day {
            min-height: 50px;
          }

          .day-number {
            font-size: 0.8rem;
          }

          .time-slots-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .legend-item {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;