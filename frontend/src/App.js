import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppointmentForm from './components/AppointmentForm';
import AdminDashboard from './components/AdminDashboard';
import AppointmentConfirmation from './components/AppointmentConfirmation';
import { Calendar, Users, BarChart3, Settings, Home, Phone, Mail } from 'lucide-react';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <Router>
      <div className="app-container">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Noto Sans Arabic',
            },
          }}
        />
        
        <header className="header-section">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="h2 mb-2">الثانوية التأهيلية تالمست</h1>
                <h2 className="h4 mb-0 opacity-90">نظام حجز المواعيد للتسجيل</h2>
              </div>
              <div className="col-md-4 text-md-start text-center mt-3 mt-md-0">
                <div className="contact-info">
                  <div className="d-flex align-items-center justify-content-md-start justify-content-center text-sm">
                    <Phone size={16} className="ms-2" />
                    <span>+212 5XX XX XX XX</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-md-start justify-content-center text-sm mt-1">
                    <Mail size={16} className="ms-2" />
                    <span>contact@lycee-talmest.ma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Navigation currentView={currentView} setCurrentView={setCurrentView} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage setCurrentView={setCurrentView} />} />
            <Route path="/appointment" element={<AppointmentForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/confirmation/:id" element={<AppointmentConfirmation />} />
          </Routes>
        </main>

        <footer className="footer-section">
          <div className="container text-center">
            <div className="row">
              <div className="col-12">
                <p className="mb-2">© 2025 الثانوية التأهيلية تالمست - جميع الحقوق محفوظة</p>
                <p className="text-sm opacity-75">
                  تالمست، المغرب | هاتف: +212 5XX XX XX XX
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Navigation({ currentView, setCurrentView }) {
  const location = useLocation();

  return (
    <nav className="navigation-bar">
      <div className="container">
        <div className="nav-items">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <Home size={20} />
            <span>الرئيسية</span>
          </Link>
          
          <Link 
            to="/appointment" 
            className={`nav-item ${location.pathname === '/appointment' ? 'active' : ''}`}
            onClick={() => setCurrentView('appointment')}
          >
            <Calendar size={20} />
            <span>حجز موعد</span>
          </Link>
          
          <Link 
            to="/admin" 
            className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            <Settings size={20} />
            <span>الإدارة</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HomePage({ setCurrentView }) {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="hero-section text-center mb-5">
            <h2 className="display-6 mb-4">مرحباً بكم في نظام حجز المواعيد</h2>
            <p className="lead mb-4">
              احجز موعدك لتسجيل ابنك أو ابنتك في الثانوية التأهيلية تالمست بطريقة سهلة وسريعة
            </p>
            <Link to="/appointment" className="btn btn-primary btn-lg px-5">
              <Calendar size={20} className="ms-2" />
              ابدأ الحجز الآن
            </Link>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card card h-100 text-center p-4">
                <Calendar size={48} className="text-primary mx-auto mb-3" />
                <h5>اختيار الموعد</h5>
                <p className="text-muted">اختر التاريخ والوقت المناسب لك من الأوقات المتاحة</p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card card h-100 text-center p-4">
                <Users size={48} className="text-primary mx-auto mb-3" />
                <h5>بيانات الطالب</h5>
                <p className="text-muted">أدخل البيانات الأساسية للطالب المراد تسجيله</p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card card h-100 text-center p-4">
                <BarChart3 size={48} className="text-primary mx-auto mb-3" />
                <h5>تأكيد الحجز</h5>
                <p className="text-muted">احصل على تأكيد فوري لموعدك مع إمكانية طباعة المعلومات</p>
              </div>
            </div>
          </div>

          <div className="info-section mt-5">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">معلومات مهمة</h4>
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">أوقات العمل:</h6>
                    <ul className="list-unstyled">
                      <li>• الإثنين - الخميس: 8:00 - 12:00 | 14:00 - 17:00</li>
                      <li>• الجمعة والسبت: مغلق</li>
                      <li>• العطل الرسمية: مغلق</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">الوثائق المطلوبة:</h6>
                    <ul className="list-unstyled">
                      <li>• شهادة الباكالوريا أو ما يعادلها</li>
                      <li>• بطاقة التعريف الوطنية</li>
                      <li>• صور شمسية حديثة</li>
                      <li>• شهادة طبية</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;