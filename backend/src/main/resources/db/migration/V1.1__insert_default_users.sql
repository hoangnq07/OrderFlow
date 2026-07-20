-- Insert default admin and user (password for both is 'admin123')
INSERT INTO users (username, email, password, full_name, role, active)
VALUES 
('admin', 'admin@orderflow.com', '$2a$10$ZC4eiPn25JMEntSoCC/0uuUlxO.dmifem0QW0LrY5ImHaUaBQwSFe', 'Admin User', 'ADMIN', true),
('user', 'user@orderflow.com', '$2a$10$ZC4eiPn25JMEntSoCC/0uuUlxO.dmifem0QW0LrY5ImHaUaBQwSFe', 'Normal User', 'USER', true)
ON CONFLICT (username) DO NOTHING;
