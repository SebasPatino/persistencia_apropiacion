-- ============================================================
-- RBAC: Tablas de Roles, Permisos y Tabla Pivote
-- Punto C — Guía de Aprendizaje SENA: Autorizaciones
-- ============================================================
USE inventario_adso;

-- Desactivar Safe Update Mode para permitir UPDATE sin PK en WHERE
SET SQL_SAFE_UPDATES = 0;

-- ── 1. Tabla de ROLES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Tabla de PERMISOS ATÓMICOS ────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. TABLA PIVOTE: role_permissions (M:N) ──────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),

  CONSTRAINT fk_rp_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_rp_permission
    FOREIGN KEY (permission_id)
    REFERENCES permissions(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- ── 4. Agregar columna role_id a users ───────────────────────
ALTER TABLE users ADD COLUMN role_id INT AFTER email;

-- ── 5. Insertar los ROLES ────────────────────────────────────
INSERT INTO roles (id, name, description) VALUES
  (1, 'admin', 'Administrador con acceso total al sistema'),
  (2, 'user',  'Usuario regular con acceso de solo lectura');

-- ── 6. Insertar los PERMISOS ATÓMICOS ────────────────────────
INSERT INTO permissions (id, code, description) VALUES
  (1, 'products.read',    'Ver lista y detalle de productos'),
  (2, 'products.create',  'Crear un nuevo producto'),
  (3, 'products.update',  'Editar un producto existente'),
  (4, 'products.delete',  'Eliminar un producto'),
  (5, 'categories.read',   'Ver lista y detalle de categorías'),
  (6, 'categories.create', 'Crear una nueva categoría'),
  (7, 'categories.update', 'Editar una categoría existente'),
  (8, 'categories.delete', 'Eliminar una categoría');

-- ── 7. Asignar PERMISOS a ROLES (Tabla Pivote) ───────────────
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4),
  (1, 5), (1, 6), (1, 7), (1, 8);

INSERT INTO role_permissions (role_id, permission_id) VALUES
  (2, 1),
  (2, 5);

-- ── 8. Mapear usuarios existentes a role_id ──────────────────
UPDATE users SET role_id = 1 WHERE role = 'admin';
UPDATE users SET role_id = 2 WHERE role = 'user';
UPDATE users SET role_id = 2 WHERE role IS NULL;

-- ── 9. Agregar FK de users → roles ───────────────────────────
ALTER TABLE users
  ADD CONSTRAINT fk_user_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Volver a activar Safe Update Mode
SET SQL_SAFE_UPDATES = 1;