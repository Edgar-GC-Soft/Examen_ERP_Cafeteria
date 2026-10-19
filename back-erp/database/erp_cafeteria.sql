-- Base de datos nueva del ERP Cafetería (ejecutar en phpMyAdmin > SQL)
SET NAMES utf8mb4;
DROP DATABASE IF EXISTS erp_cafeteria;
CREATE DATABASE erp_cafeteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_cafeteria;

-- solo 2 roles: admin y cliente
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  salario DECIMAL(10,2) NULL,
  CHECK (salario IS NULL OR salario >= 0)
);

CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  correo VARCHAR(100),
  direccion VARCHAR(200)
);

-- cada cambio de precio crea una fila nueva; la anterior se marca con fecha_baja (historial de precios)
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200),
  costo_compra DECIMAL(10,2) NOT NULL,
  costo_venta DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imagen VARCHAR(200),
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_baja DATETIME NULL,
  CHECK (costo_compra > 0 AND costo_venta > 0 AND stock >= 0)
);

CREATE TABLE compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  administrador_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (administrador_id) REFERENCES usuarios(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE detalle_compra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- metodo_pago: solo paypal o efectivo
-- estado: CREADA -> PROCESANDO -> PAGADA (o REVISION si PayPal no confirma)
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('paypal','efectivo') NOT NULL,
  estado ENUM('CREADA','PROCESANDO','PAGADA','REVISION') NOT NULL DEFAULT 'CREADA',
  paypal_order_id VARCHAR(50) NULL,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- comprobante escolar (no es un CFDI real); xml guarda el contenido del archivo
CREATE TABLE facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL UNIQUE,
  folio VARCHAR(20) NOT NULL,
  fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  nombre_receptor VARCHAR(100) NOT NULL,
  rfc_receptor VARCHAR(13) NOT NULL,
  xml MEDIUMTEXT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

CREATE TABLE asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  administrador_id INT NOT NULL,
  hora_llegada DATETIME NOT NULL,
  hora_salida DATETIME NULL,
  FOREIGN KEY (administrador_id) REFERENCES usuarios(id)
);

CREATE TABLE nominas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  administrador_id INT NOT NULL,
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (administrador_id) REFERENCES usuarios(id)
);

CREATE TABLE transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('Ingreso','Egreso') NOT NULL,
  concepto VARCHAR(150) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  origen ENUM('Venta','Compra','Nómina') NOT NULL,
  venta_id INT NULL,
  compra_id INT NULL,
  nomina_id INT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (compra_id) REFERENCES compras(id),
  FOREIGN KEY (nomina_id) REFERENCES nominas(id)
);

-- datos de ejemplo (los usuarios se crean con: node seed.js)
INSERT INTO productos (nombre, descripcion, costo_compra, costo_venta, stock, imagen) VALUES
('Café americano', 'Café de grano 12 oz', 15.00, 45.00, 50, 'imagenes/americano.jpg'),
('Capuchino', 'Espresso con leche espumada', 20.00, 65.00, 40, 'imagenes/capuchino.jpg'),
('Pan de elote', 'Rebanada de pan artesanal', 14.00, 38.00, 8, 'imagenes/pan.jpg'),
('Croissant', 'Croissant de mantequilla', 12.00, 35.00, 25, 'imagenes/croissant.jpg');

INSERT INTO proveedores (nombre, contacto, telefono, correo, direccion) VALUES
('Lácteos del Valle', 'María López', '3312345678', 'ventas@lacteos.com', 'Zapopan, Jal.'),
('Café de Altura', 'Juan Pérez', '3398765432', 'contacto@cafealtura.com', 'Tlaquepaque, Jal.');
