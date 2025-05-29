import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Calendar, BarChart3, Download, Search, 
  Edit, Trash2, CheckCircle, Clock, XCircle,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import jsPDF from 'jspdf';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    statut: ''
  });

  // État pour l'édition
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Définir les fonctions de récupération des données avec useCallback
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/admin/appointments?${params}`);
      
      if (response.data.success) {
        setAppointments(response.data.appointments);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast.error('خطأ في تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/statistics');
      
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect hook qui utilise les fonctions définies ci-dessus
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab, fetchAppointments, fetchStatistics]);

  // Effect séparé pour les changements de pagination et filtres
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [pagination.page, filters, fetchAppointments]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment({ ...appointment });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/admin/appointments/${editingAppointment.id}`, editingAppointment);
      
      if (response.data.success) {
        toast.success('تم تحديث الموعد بنجاح');
        setShowEditModal(false);
        setEditingAppointment(null);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('خطأ في تحديث الموعد');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id, nom, prenom) => {
    if (window.confirm(`هل أنت متأكد من حذف موعد ${prenom} ${nom}؟`)) {
      try {
        const response = await api.delete(`/admin/appointments/${id}`);
        
        if (response.data.success) {
          toast.success('تم حذف الموعد بنجاح');
          fetchAppointments();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('خطأ في حذف الموعد');
      }
    }
  };

  const exportToPDF = async (date = null) => {
    try {
      const exportDate = date || new Date().toISOString().split('T')[0];
      const response = await api.get(`/admin/appointments/export/${exportDate}`);
      
      if (response.data.success) {
        const data = response.data;
        const doc = new jsPDF();
        
        // En-tête
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('الثانوية التأهيلية تالمست', 105, 20, { align: 'center' });
        doc.text('قائمة المواعيد', 105, 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`التاريخ: ${data.date_formatted}`, 105, 45, { align: 'center' });
        doc.text(`عدد المواعيد: ${data.total}`, 105, 55, { align: 'center' });
        
        // Tableau
        let y = 75;
        doc.setFont('helvetica', 'bold');
        doc.text('الوقت', 20, y);
        doc.text('الاسم', 50, y);
        doc.text('الهاتف', 100, y);
        doc.text('المستوى', 140, y);
        doc.text('الحالة', 170, y);
        
        y += 5;
        doc.line(15, y, 195, y);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        data.appointments.forEach((appointment) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(appointment.heure_formatted, 20, y);
          doc.text(`${appointment.prenom} ${appointment.nom}`, 50, y);
          doc.text(appointment.telephone, 100, y);
          doc.text(appointment.niveau_scolaire.substring(0, 15), 140, y);
          doc.text(appointment.statut, 170, y);
          y += 8;
        });
        
        doc.save(`mawaid_${data.date_formatted}.pdf`);
        toast.success('تم إنشاء ملف PDF بنجاح');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('خطأ في إنشاء ملف PDF');
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'confirmé': { class: 'bg-success', icon: CheckCircle, text: 'مؤكد' },
      'en_attente': { class: 'bg-warning', icon: Clock, text: 'في الانتظار' },
      'annulé': { class: 'bg-danger', icon: XCircle, text: 'ملغى' }
    };
    
    const badge = badges[statut] || { class: 'bg-secondary', icon: Clock, text: statut };
    const IconComponent = badge.icon;
    
    return (
      <span className={`badge ${badge.class} d-flex align-items-center gap-1`}>
        <IconComponent size={14} />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <Users className="ms-2" size={24} />
                لوحة التحكم الإدارية
              </h4>
            </div>
            
            <div className="card-body">
              {/* Navigation Tabs */}
              <div className="nav nav-tabs mb-4" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar className="ms-2" size={16} />
                  إدارة المواعيد
                </button>
                <button
                  className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('statistics')}
                >
                  <BarChart3 className="ms-2" size={16} />
                  الإحصائيات
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'appointments' && (
                <div className="appointments-tab">
                  {/* Filtres */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="البحث بالاسم أو الهاتف..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="date"
                        className="form-control"
                        value={filters.date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={filters.statut}
                        onChange={(e) => handleFilterChange('statut', e.target.value)}
                      >
                        <option value="">جميع الحالات</option>
                        <option value="confirmé">مؤكد</option>
                        <option value="en_attente">في الانتظار</option>
                        <option value="annulé">ملغى</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={fetchAppointments}
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>المواعيد ({pagination.total})</h5>
                    <button
                      className="btn btn-success"
                      onClick={() => exportToPDF()}
                    >
                      <Download className="ms-2" size={16} />
                      تصدير اليوم
                    </button>
                  </div>

                  {/* Table des rendez-vous */}
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="loading-spinner mx-auto mb-3"></div>
                      <p>جاري تحميل المواعيد...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>المرجع</th>
                              <th>الاسم الكامل</th>
                              <th>الهاتف</th>
                              <th>التاريخ</th>
                              <th>الوقت</th>
                              <th>المستوى</th>
                              <th>الحالة</th>
                              <th>الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td>#{appointment.id}</td>
                                <td>
                                  <div>
                                    <strong>{appointment.prenom} {appointment.nom}</strong>
                                    <br />
                                    <small className="text-muted">{appointment.sexe}</small>
                                  </div>
                                </td>
                                <td>{appointment.telephone}</td>
                                <td>{appointment.date_formatted}</td>
                                <td>
                                  <span className="badge bg-light text-dark">
                                    {appointment.heure_formatted}
                                  </span>
                                </td>
                                <td>
                                  <small>{appointment.niveau_scolaire}</small>
                                </td>
                                <td>{getStatusBadge(appointment.statut)}</td>
                                <td>
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleEditAppointment(appointment)}
                                      title="تعديل"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeleteAppointment(
                                        appointment.id, 
                                        appointment.nom, 
                                        appointment.prenom
                                      )}
                                      title="حذف"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <nav aria-label="Page navigation">
                            <ul className="pagination">
                              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                  disabled={pagination.page === 1}
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </li>
                              
                              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                                <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                  >
                                    {pageNum}
                                  </button>
                                </li>
                              ))}
                              
                              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                  disabled={pagination.page === pagination.totalPages}
                                >
                                  <ChevronLeft size={16} />
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="statistics-tab">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="loading-spinner mx-auto mb-3"></div>
                      <p>جاري تحميل الإحصائيات...</p>
                    </div>
                  ) : statistics ? (
                    <>
                      {/* Statistiques générales */}
                      <div className="stats-grid mb-5">
                        <div className="stat-card total">
                          <div className="stat-number text-primary">
                            {statistics.general.total_appointments}
                          </div>
                          <div className="stat-label">إجمالي المواعيد</div>
                        </div>
                        
                        <div className="stat-card confirmed">
                          <div className="stat-number text-success">
                            {statistics.general.confirmed}
                          </div>
                          <div className="stat-label">مواعيد مؤكدة</div>
                        </div>
                        
                        <div className="stat-card pending">
                          <div className="stat-number text-warning">
                            {statistics.general.pending}
                          </div>
                          <div className="stat-label">في الانتظار</div>
                        </div>
                        
                        <div className="stat-card cancelled">
                          <div className="stat-number text-danger">
                            {statistics.general.cancelled}
                          </div>
                          <div className="stat-label">مواعيد ملغاة</div>
                        </div>
                      </div>

                      <div className="row">
                        {/* Statistiques par jour */}
                        <div className="col-md-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">المواعيد اليومية (آخر 7 أيام)</h6>
                            </div>
                            <div className="card-body">
                              {statistics.daily.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm">
                                    <thead>
                                      <tr>
                                        <th>التاريخ</th>
                                        <th>العدد</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {statistics.daily.map((day, index) => (
                                        <tr key={index}>
                                          <td>{day.date_formatted}</td>
                                          <td>
                                            <span className="badge bg-primary">{day.count}</span>
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

                        {/* Statistiques par niveau */}
                        <div className="col-md-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">التوزيع حسب المستوى الدراسي</h6>
                            </div>
                            <div className="card-body">
                              {statistics.byLevel.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm">
                                    <thead>
                                      <tr>
                                        <th>المستوى</th>
                                        <th>العدد</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {statistics.byLevel.map((level, index) => (
                                        <tr key={index}>
                                          <td>{level.niveau_scolaire}</td>
                                          <td>
                                            <span className="badge bg-info">{level.count}</span>
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
                      </div>

                      {/* Rendez-vous à venir */}
                      {statistics.upcoming.length > 0 && (
                        <div className="card">
                          <div className="card-header">
                            <h6 className="mb-0">المواعيد القادمة (7 أيام)</h6>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>التاريخ</th>
                                    <th>عدد المواعيد</th>
                                    <th>الإجراءات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statistics.upcoming.map((day, index) => (
                                    <tr key={index}>
                                      <td>{day.date_formatted}</td>
                                      <td>
                                        <span className="badge bg-success">{day.count}</span>
                                      </td>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => exportToPDF(day.date)}
                                        >
                                          <Download size={14} className="ms-1" />
                                          تصدير
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="alert alert-info text-center">
                      <p className="mb-0">لا توجد إحصائيات متاحة</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && editingAppointment && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تعديل الموعد #{editingAppointment.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">الاسم العائلي</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingAppointment.nom}
                        onChange={(e) => setEditingAppointment(prev => ({ ...prev, nom: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">الاسم الشخصي</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingAppointment.prenom}
                        onChange={(e) => setEditingAppointment(prev => ({ ...prev, prenom: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">الهاتف</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editingAppointment.telephone}
                        onChange={(e) => setEditingAppointment(prev => ({ ...prev, telephone: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">الحالة</label>
                      <select
                        className="form-select"
                        value={editingAppointment.statut}
                        onChange={(e) => setEditingAppointment(prev => ({ ...prev, statut: e.target.value }))}
                      >
                        <option value="en_attente">في الانتظار</option>
                        <option value="confirmé">مؤكد</option>
                        <option value="annulé">ملغى</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">ملاحظات</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editingAppointment.notes || ''}
                      onChange={(e) => setEditingAppointment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;