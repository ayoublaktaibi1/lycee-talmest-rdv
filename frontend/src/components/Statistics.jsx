import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, Clock, 
  Download, RefreshCw, Filter, Eye 
} from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const Statistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/statistics');
      
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Erreur statistiques:', error);
      toast.error('خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
    toast.success('تم تحديث الإحصائيات');
  };

  const getStatusBadge = (status, count) => {
    const badges = {
      'confirmé': { class: 'bg-success', text: 'مؤكد' },
      'en_attente': { class: 'bg-warning', text: 'في الانتظار' },
      'annulé': { class: 'bg-danger', text: 'ملغى' }
    };
    
    const badge = badges[status] || { class: 'bg-secondary', text: status };
    
    return (
      <span className={`badge ${badge.class} d-flex align-items-center justify-content-between`}>
        <span>{badge.text}</span>
        <span className="fw-bold ms-2">{count}</span>
      </span>
    );
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading && !statistics) {
    return (
      <div className="text-center py-5">
        <div className="loading-spinner mx-auto mb-3"></div>
        <p>جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="alert alert-info text-center">
        <BarChart3 size={48} className="mb-3 text-muted" />
        <h5>لا توجد إحصائيات متاحة</h5>
        <button className="btn btn-primary mt-2" onClick={fetchStatistics}>
          <RefreshCw size={16} className="ms-2" />
          إعادة التحميل
        </button>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Header avec actions */}
      <div className="statistics-header">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="text-primary mb-0">
            <BarChart3 className="ms-2" size={24} />
            الإحصائيات والتقارير
          </h4>
          
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="7days">آخر 7 أيام</option>
              <option value="30days">آخر 30 يوم</option>
              <option value="3months">آخر 3 أشهر</option>
              <option value="all">جميع الفترات</option>
            </select>
            
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="stats-overview mb-5">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="stat-card total">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statistics.general.total_appointments}</div>
                <div className="stat-label">إجمالي المواعيد</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +{statistics.general.today_appointments} اليوم
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat-card confirmed">
              <div className="stat-icon">
                <Calendar size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statistics.general.confirmed}</div>
                <div className="stat-label">مواعيد مؤكدة</div>
                <div className="stat-percentage">
                  {calculatePercentage(statistics.general.confirmed, statistics.general.total_appointments)}%
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat-card pending">
              <div className="stat-icon">
                <Clock size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statistics.general.pending}</div>
                <div className="stat-label">في الانتظار</div>
                <div className="stat-percentage">
                  {calculatePercentage(statistics.general.pending, statistics.general.total_appointments)}%
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="stat-card cancelled">
              <div className="stat-icon">
                <Eye size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{statistics.general.cancelled}</div>
                <div className="stat-label">مواعيد ملغاة</div>
                <div className="stat-percentage">
                  {calculatePercentage(statistics.general.cancelled, statistics.general.total_appointments)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Statistiques par statut */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">التوزيع حسب الحالة</h6>
            </div>
            <div className="card-body">
              {statistics.byStatus.length > 0 ? (
                <div className="status-distribution">
                  {statistics.byStatus.map((status, index) => (
                    <div key={index} className="status-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {getStatusBadge(status.statut, status.count)}
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${calculatePercentage(status.count, statistics.general.total_appointments)}%`,
                            backgroundColor: status.statut === 'confirmé' ? '#10b981' : 
                                           status.statut === 'en_attente' ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques quotidiennes */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">المواعيد اليومية (آخر 7 أيام)</h6>
            </div>
            <div className="card-body">
              {statistics.daily.length > 0 ? (
                <div className="daily-stats">
                  {statistics.daily.map((day, index) => (
                    <div key={index} className="daily-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="date-label">{day.date_formatted}</span>
                        <span className="badge bg-primary">{day.count}</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-primary"
                          style={{ 
                            width: `${calculatePercentage(day.count, Math.max(...statistics.daily.map(d => d.count)))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques par niveau scolaire */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">التوزيع حسب المستوى الدراسي</h6>
              <button className="btn btn-sm btn-outline-primary">
                <Download size={14} className="ms-1" />
                تصدير
              </button>
            </div>
            <div className="card-body">
              {statistics.byLevel.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>المستوى الدراسي</th>
                        <th className="text-center">العدد</th>
                        <th className="text-center">النسبة</th>
                        <th>التمثيل البياني</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.byLevel.map((level, index) => (
                        <tr key={index}>
                          <td>
                            <span className="fw-medium">{level.niveau_scolaire}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info">{level.count}</span>
                          </td>
                          <td className="text-center">
                            {calculatePercentage(level.count, statistics.general.total_appointments)}%
                          </td>
                          <td>
                            <div className="progress" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar bg-info"
                                style={{ 
                                  width: `${calculatePercentage(level.count, statistics.general.total_appointments)}%`
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>

        {/* Rendez-vous à venir */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">المواعيد القادمة</h6>
            </div>
            <div className="card-body">
              {statistics.upcoming.length > 0 ? (
                <div className="upcoming-appointments">
                  {statistics.upcoming.map((day, index) => (
                    <div key={index} className="upcoming-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-medium">{day.date_formatted}</div>
                          <small className="text-muted">
                            {day.count} موعد
                          </small>
                        </div>
                        <span className="badge bg-success">{day.count}</span>
                      </div>
                      {index < statistics.upcoming.length - 1 && (
                        <hr className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <Calendar size={32} className="mb-2 opacity-50" />
                  <p className="mb-0">لا توجد مواعيد قادمة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par sexe (si disponible) */}
      {statistics.byGender && statistics.byGender.length > 0 && (
        <div className="row mt-4">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">التوزيع حسب الجنس</h6>
              </div>
              <div className="card-body">
                <div className="gender-stats">
                  {statistics.byGender.map((gender, index) => (
                    <div key={index} className="gender-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-medium">{gender.sexe}</span>
                        <span className="badge bg-secondary">{gender.count}</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${calculatePercentage(gender.count, statistics.general.total_appointments)}%`,
                            backgroundColor: gender.sexe === 'ذكر' ? '#3b82f6' : '#ec4899'
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {calculatePercentage(gender.count, statistics.general.total_appointments)}%
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .statistics-container {
          padding: 1rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          border-left: 4px solid;
          transition: transform 0.3s ease;
          height: 100%;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-card.total { border-left-color: #2563eb; }
        .stat-card.confirmed { border-left-color: #10b981; }
        .stat-card.pending { border-left-color: #f59e0b; }
        .stat-card.cancelled { border-left-color: #ef4444; }

        .stat-card .stat-icon {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .stat-label {
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-change {
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-percentage {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .daily-stats, .upcoming-appointments {
          max-height: 300px;
          overflow-y: auto;
        }

        .daily-item, .upcoming-item {
          margin-bottom: 1rem;
        }

        .daily-item:last-child, .upcoming-item:last-child {
          margin-bottom: 0;
        }

        .date-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .gender-item, .status-item {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .gender-item:last-child, .status-item:last-child {
          margin-bottom: 0;
        }

        .progress {
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar {
          transition: width 0.6s ease;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .statistics-container {
            padding: 0.5rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-number {
            font-size: 2rem;
          }

          .statistics-header .d-flex {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Statistics;