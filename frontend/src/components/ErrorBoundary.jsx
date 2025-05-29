import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Met à jour le state pour afficher l'UI d'erreur
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur pour le debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // En production, on pourrait envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Ici on pourrait envoyer l'erreur à un service comme Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISO8601String(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Exemple d'envoi (à remplacer par votre service)
    console.log('Error logged:', errorData);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const subject = encodeURIComponent(`خطأ في التطبيق - ${this.state.errorId}`);
    const body = encodeURIComponent(`
تفاصيل الخطأ:
- معرف الخطأ: ${this.state.errorId}
- الوقت: ${new Date().toLocaleString('ar')}
- المتصفح: ${navigator.userAgent}
- الصفحة: ${window.location.href}

رسالة الخطأ: ${this.state.error?.message || 'غير محدد'}

يرجى وصف ما كنت تفعله عند حدوث الخطأ:
`);
    
    window.open(`mailto:support@lycee-talmest.ma?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>
            
            <div className="error-message">
              <h2>عذراً، حدث خطأ غير متوقع</h2>
              <p>نعتذر عن هذا الإزعاج. حدث خطأ تقني يمنع التطبيق من العمل بشكل صحيح.</p>
            </div>

            <div className="error-details">
              <div className="error-id">
                <strong>معرف الخطأ:</strong> {this.state.errorId}
              </div>
              <div className="error-time">
                <strong>الوقت:</strong> {new Date().toLocaleString('ar')}
              </div>
            </div>

            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleReload}
              >
                <RefreshCw size={20} className="ms-2" />
                إعادة تحميل الصفحة
              </button>
              
              <button 
                className="btn btn-outline-primary"
                onClick={this.handleGoHome}
              >
                <Home size={20} className="ms-2" />
                العودة للرئيسية
              </button>
              
              <button 
                className="btn btn-outline-secondary"
                onClick={this.handleReportError}
              >
                <Mail size={20} className="ms-2" />
                الإبلاغ عن المشكلة
              </button>
            </div>

            {/* Affichage détaillé en mode développement */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-technical-details">
                <summary>تفاصيل تقنية (وضع التطوير)</summary>
                <div className="error-stack">
                  <h4>رسالة الخطأ:</h4>
                  <pre>{this.state.error?.message}</pre>
                  
                  <h4>مكان الخطأ:</h4>
                  <pre>{this.state.error?.stack}</pre>
                  
                  <h4>مكونات React:</h4>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-help">
              <h4>ما يمكنك فعله:</h4>
              <ul>
                <li>إعادة تحميل الصفحة قد يحل المشكلة</li>
                <li>تأكد من اتصالك بالإنترنت</li>
                <li>امسح ذاكرة التخزين المؤقت للمتصفح</li>
                <li>جرب استخدام متصفح آخر</li>
                <li>إذا استمرت المشكلة، يرجى الإبلاغ عنها</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              font-family: 'Noto Sans Arabic', Arial, sans-serif;
              direction: rtl;
              text-align: right;
            }

            .error-content {
              background: white;
              border-radius: 20px;
              padding: 3rem;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
            }

            .error-icon {
              color: #ef4444;
              margin-bottom: 2rem;
            }

            .error-message h2 {
              color: #1f2937;
              margin-bottom: 1rem;
              font-size: 1.5rem;
              font-weight: 600;
            }

            .error-message p {
              color: #6b7280;
              line-height: 1.6;
              margin-bottom: 2rem;
            }

            .error-details {
              background: #f8fafc;
              border-radius: 10px;
              padding: 1rem;
              margin-bottom: 2rem;
              text-align: right;
              font-size: 0.9rem;
            }

            .error-details div {
              margin-bottom: 0.5rem;
            }

            .error-details div:last-child {
              margin-bottom: 0;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 2rem;
            }

            .btn {
              display: inline-flex;
              align-items: center;
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              text-decoration: none;
              font-weight: 500;
              border: 2px solid;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .btn-primary {
              background: #2563eb;
              color: white;
              border-color: #2563eb;
            }

            .btn-primary:hover {
              background: #1d4ed8;
              border-color: #1d4ed8;
              transform: translateY(-2px);
            }

            .btn-outline-primary {
              background: transparent;
              color: #2563eb;
              border-color: #2563eb;
            }

            .btn-outline-primary:hover {
              background: #2563eb;
              color: white;
              transform: translateY(-2px);
            }

            .btn-outline-secondary {
              background: transparent;
              color: #6b7280;
              border-color: #6b7280;
            }

            .btn-outline-secondary:hover {
              background: #6b7280;
              color: white;
              transform: translateY(-2px);
            }

            .error-technical-details {
              text-align: right;
              margin-bottom: 2rem;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 1rem;
            }

            .error-technical-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 1rem;
            }

            .error-stack {
              font-size: 0.8rem;
            }

            .error-stack h4 {
              color: #374151;
              margin: 1rem 0 0.5rem 0;
              font-size: 0.9rem;
            }

            .error-stack pre {
              background: #1f2937;
              color: #f3f4f6;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
              font-size: 0.75rem;
              direction: ltr;
              text-align: left;
            }

            .error-help {
              text-align: right;
              background: #eff6ff;
              border-radius: 10px;
              padding: 1.5rem;
            }

            .error-help h4 {
              color: #1d4ed8;
              margin-bottom: 1rem;
              font-size: 1rem;
            }

            .error-help ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            .error-help li {
              color: #374151;
              margin-bottom: 0.5rem;
              padding-right: 1rem;
              position: relative;
            }

            .error-help li:before {
              content: '•';
              color: #2563eb;
              position: absolute;
              right: 0;
              font-weight: bold;
            }

            @media (max-width: 768px) {
              .error-boundary-container {
                padding: 1rem;
              }

              .error-content {
                padding: 2rem 1.5rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .btn {
                width: 100%;
                justify-content: center;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant pour afficher les erreurs de récupération de données
export const ErrorMessage = ({ 
  error, 
  onRetry = null, 
  title = 'حدث خطأ',
  showDetails = false 
}) => {
  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'خطأ غير معروف';
  };

  return (
    <div className="error-message-container">
      <div className="error-message-content">
        <AlertTriangle className="error-icon" size={48} />
        <h4 className="error-title">{title}</h4>
        <p className="error-description">{getErrorMessage(error)}</p>
        
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            <RefreshCw size={16} className="ms-2" />
            إعادة المحاولة
          </button>
        )}

        {showDetails && error && (
          <details className="error-details-toggle">
            <summary>عرض التفاصيل</summary>
            <pre className="error-details-content">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>

      <style jsx>{`
        .error-message-container {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 2rem;
          margin: 1rem 0;
          text-align: center;
        }

        .error-message-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .error-icon {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-title {
          color: #991b1b;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .error-description {
          color: #7f1d1d;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .error-details-toggle {
          margin-top: 1rem;
          text-align: right;
        }

        .error-details-toggle summary {
          cursor: pointer;
          color: #7f1d1d;
          font-size: 0.9rem;
        }

        .error-details-content {
          background: #7f1d1d;
          color: white;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          overflow-x: auto;
          font-size: 0.75rem;
          direction: ltr;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

// Hook pour capturer les erreurs dans les composants fonctionnels
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);
  
  const handleError = React.useCallback((error) => {
    console.error('Handled error:', error);
    setError(error);
  }, []);

  return { error, handleError, resetError };
};

export default ErrorBoundary;