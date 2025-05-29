import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = '', 
  overlay = false, 
  color = 'primary',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md', 
    large: 'spinner-lg'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    white: 'text-white'
  };

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`;

  const content = (
    <div className="loading-content">
      <div className={spinnerClass}>
        <Loader2 className="spinner-icon" />
      </div>
      {message && (
        <div className="loading-message mt-3">
          {message}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
        <style jsx>{`
          .loading-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
          }
        `}</style>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
        <style jsx>{`
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: inherit;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="loading-container">
      {content}
      
      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-spinner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        .spinner-sm .spinner-icon {
          width: 20px;
          height: 20px;
        }

        .spinner-md .spinner-icon {
          width: 32px;
          height: 32px;
        }

        .spinner-lg .spinner-icon {
          width: 48px;
          height: 48px;
        }

        .loading-message {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .text-primary {
          color: #2563eb;
        }

        .text-secondary {
          color: #64748b;
        }

        .text-success {
          color: #10b981;
        }

        .text-warning {
          color: #f59e0b;
        }

        .text-danger {
          color: #ef4444;
        }

        .text-white {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};

// Composant pour les boutons avec état de chargement
export const LoadingButton = ({ 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  loadingText = 'جاري التحميل...',
  ...props 
}) => {
  return (
    <button
      className={`btn ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="white" />
          <span className="ms-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
      
      <style jsx>{`
        .btn.loading {
          position: relative;
          pointer-events: none;
        }
        
        .btn.loading .loading-spinner {
          display: inline-flex;
          margin-left: 0.5rem;
        }
      `}</style>
    </button>
  );
};

// Composant pour les overlays de chargement sur les cartes
export const CardLoadingOverlay = ({ loading = false, children, message = '' }) => {
  return (
    <div className="card-loading-container">
      {children}
      {loading && (
        <div className="card-loading-overlay">
          <LoadingSpinner size="medium" message={message} />
        </div>
      )}
      
      <style jsx>{`
        .card-loading-container {
          position: relative;
        }
        
        .card-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: inherit;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

// Composant pour le chargement des tableaux
export const TableLoadingRow = ({ colSpan = 1, message = 'جاري التحميل...' }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-5">
        <LoadingSpinner size="medium" message={message} />
      </td>
    </tr>
  );
};

// Composant pour le skeleton loading
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  count = 1,
  className = ''
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        marginBottom: count > 1 ? '0.5rem' : '0'
      }}
    />
  ));

  return (
    <div className="skeleton-container">
      {skeletons}
      
      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Composant pour le chargement des listes
export const ListLoadingSkeleton = ({ items = 3 }) => {
  return (
    <div className="list-skeleton">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="list-item-skeleton">
          <SkeletonLoader width="60px" height="60px" borderRadius="8px" />
          <div className="list-content-skeleton">
            <SkeletonLoader width="70%" height="18px" />
            <SkeletonLoader width="50%" height="14px" />
            <SkeletonLoader width="80%" height="14px" />
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .list-skeleton {
          padding: 1rem;
        }
        
        .list-item-skeleton {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .list-content-skeleton {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;