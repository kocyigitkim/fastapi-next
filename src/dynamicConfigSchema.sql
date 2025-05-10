-- Application Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `group` VARCHAR(50) NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_group_key` (`group`, `key`)
);

-- Authentication Providers Table
CREATE TABLE IF NOT EXISTS auth_providers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSON NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authentication Permissions Table
CREATE TABLE IF NOT EXISTS auth_permissions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  description TEXT,
  roles JSON, -- JSON array of role names or IDs that have this permission
  enabled BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authentication Roles Table
CREATE TABLE IF NOT EXISTS auth_roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSON NOT NULL, -- JSON array of permission names or IDs assigned to this role
  enabled BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_app_settings_group ON app_settings(`group`);
CREATE INDEX idx_auth_providers_type ON auth_providers(type);
CREATE INDEX idx_auth_permissions_path ON auth_permissions(path);

-- Example application settings
INSERT INTO app_settings (id, `key`, `value`, `group`, description, enabled) VALUES
('1', 'apiUrl', 'https://api.example.com', 'api', 'Base URL for API calls', 1),
('2', 'itemsPerPage', '20', 'pagination', 'Default number of items per page', 1),
('3', 'theme', '{"primary":"#1976d2","secondary":"#424242","accent":"#82B1FF"}', 'ui', 'Application theme colors', 1),
('4', 'sessionTimeout', '3600', 'auth', 'Session timeout in seconds', 1),
('5', 'enableAnalytics', 'true', 'features', 'Whether to enable analytics', 1),
('6', 'mailConfig', '{"host":"smtp.example.com","port":587,"secure":true}', 'mail', 'SMTP server configuration', 1);

-- Example authentication providers
INSERT INTO auth_providers (id, name, type, config, enabled) VALUES
('1', 'Local Authentication', 'local', '{
  "passwordMinLength": 8,
  "passwordRequireUppercase": true,
  "passwordRequireNumbers": true,
  "passwordRequireSymbols": true,
  "lockoutEnabled": true,
  "maxFailedAttempts": 5,
  "lockoutDurationMinutes": 30
}', 1),
('2', 'Google OAuth', 'oauth', '{
  "clientId": "google-client-id",
  "clientSecret": "google-client-secret",
  "callbackUrl": "/auth/google/callback",
  "scope": ["profile", "email"]
}', 1),
('3', 'Microsoft Azure AD', 'oauth', '{
  "clientId": "azure-client-id",
  "clientSecret": "azure-client-secret",
  "callbackUrl": "/auth/azure/callback",
  "tenant": "common",
  "scope": ["profile", "email", "offline_access"]
}', 0);

-- Example permissions
INSERT INTO auth_permissions (id, name, path, description, roles, enabled) VALUES
('1', 'viewUsers', '/api/users', 'View users list', '["admin", "manager"]', 1),
('2', 'createUser', '/api/users', 'Create a new user', '["admin"]', 1),
('3', 'updateUser', '/api/users/:id', 'Update user information', '["admin", "manager"]', 1),
('4', 'deleteUser', '/api/users/:id', 'Delete a user', '["admin"]', 1),
('5', 'viewDashboard', '/api/dashboard', 'View dashboard data', '["admin", "manager", "user"]', 1),
('6', 'manageSettings', '/api/settings', 'Manage application settings', '["admin"]', 1);

-- Example roles
INSERT INTO auth_roles (id, name, description, permissions, enabled) VALUES
('1', 'admin', 'Administrator with full access', '["viewUsers", "createUser", "updateUser", "deleteUser", "viewDashboard", "manageSettings"]', 1),
('2', 'manager', 'Manager with limited administrative access', '["viewUsers", "updateUser", "viewDashboard"]', 1),
('3', 'user', 'Regular user with basic access', '["viewDashboard"]', 1); 