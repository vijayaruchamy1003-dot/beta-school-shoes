-- V2__seed_roles_and_admin.sql: Seed initial roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_CUSTOMER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
