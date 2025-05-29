-- Création de la base de données
CREATE DATABASE IF NOT EXISTS lycee_talmest_rdv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lycee_talmest_rdv;

-- Table des rendez-vous
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nom de famille',
    prenom VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Prénom',
    sexe VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sexe (ذكر/أنثى)',
    adresse TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Adresse complète',
    telephone VARCHAR(20) NOT NULL COMMENT 'Numéro de téléphone',
    niveau_scolaire VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niveau scolaire actuel',
    date_rdv DATE NOT NULL COMMENT 'Date du rendez-vous',
    heure_rdv TIME NOT NULL COMMENT 'Heure du rendez-vous',
    statut ENUM('confirmé', 'en_attente', 'annulé') DEFAULT 'en_attente' COMMENT 'Statut du rendez-vous',
    notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes administratives',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index pour optimiser les recherches
    INDEX idx_date_rdv (date_rdv),
    INDEX idx_statut (statut),
    INDEX idx_created_at (created_at),
    INDEX idx_phone (telephone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des créneaux horaires disponibles
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    heure_debut TIME NOT NULL COMMENT 'Heure de début du créneau',
    heure_fin TIME NOT NULL COMMENT 'Heure de fin du créneau',
    actif BOOLEAN DEFAULT TRUE COMMENT 'Créneau actif ou non',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des jours fériés et fermetures
CREATE TABLE closed_days (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_fermeture DATE NOT NULL COMMENT 'Date de fermeture',
    raison VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Raison de la fermeture',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date (date_fermeture)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des créneaux horaires par défaut (8h-12h et 14h-17h)
INSERT INTO time_slots (heure_debut, heure_fin) VALUES
('08:00:00', '08:30:00'),
('08:30:00', '09:00:00'),
('09:00:00', '09:30:00'),
('09:30:00', '10:00:00'),
('10:00:00', '10:30:00'),
('10:30:00', '11:00:00'),
('11:00:00', '11:30:00'),
('11:30:00', '12:00:00'),
('14:00:00', '14:30:00'),
('14:30:00', '15:00:00'),
('15:00:00', '15:30:00'),
('15:30:00', '16:00:00'),
('16:00:00', '16:30:00'),
('16:30:00', '17:00:00');

-- Insertion de quelques jours fériés marocains (exemple)
INSERT INTO closed_days (date_fermeture, raison) VALUES
('2025-01-01', 'رأس السنة الميلادية'),
('2025-01-11', 'ذكرى تقديم وثيقة الاستقلال'),
('2025-05-01', 'عيد الشغل'),
('2025-07-30', 'عيد العرش'),
('2025-08-14', 'ذكرى استرداد وادي الذهب'),
('2025-08-20', 'ذكرى ثورة الملك والشعب'),
('2025-08-21', 'عيد الشباب'),
('2025-11-06', 'ذكرى المسيرة الخضراء'),
('2025-11-18', 'عيد الاستقلال');

-- Table pour les utilisateurs admin (optionnel, pour sécuriser l'accès admin)
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    email VARCHAR(100),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion d'un utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO admin_users (username, password_hash, nom, email) VALUES
('admin', '$2b$10$rOzJqKvQg5.WcQSJY8yZKOm5xX8xX8xX8xX8xX8xX8xX8xX8xX8xX8', 'مدير النظام', 'admin@lycee-talmest.ma');

-- Vues pour faciliter les requêtes

-- Vue pour les statistiques quotidiennes
CREATE VIEW daily_stats AS
SELECT 
    date_rdv,
    COUNT(*) as total_rdv,
    COUNT(CASE WHEN statut = 'confirmé' THEN 1 END) as rdv_confirmes,
    COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as rdv_en_attente,
    COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as rdv_annules
FROM appointments 
GROUP BY date_rdv
ORDER BY date_rdv DESC;

-- Vue pour les créneaux disponibles par date
CREATE VIEW available_slots AS
SELECT 
    ts.id,
    ts.heure_debut,
    ts.heure_fin,
    DATE(NOW()) as date_check
FROM time_slots ts
WHERE ts.actif = TRUE
ORDER BY ts.heure_debut;

-- Vue pour les rendez-vous avec informations formatées
CREATE VIEW appointments_formatted AS
SELECT 
    a.*,
    DATE_FORMAT(a.date_rdv, '%d/%m/%Y') as date_formatted,
    TIME_FORMAT(a.heure_rdv, '%H:%i') as heure_formatted,
    DATE_FORMAT(a.created_at, '%d/%m/%Y à %H:%i') as created_formatted,
    CONCAT(a.prenom, ' ', a.nom) as nom_complet
FROM appointments a;