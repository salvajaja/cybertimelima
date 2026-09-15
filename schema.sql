CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT usuario_rol_check
    CHECK (rol IN ('admin', 'cliente'))
);


CREATE TABLE IF NOT EXISTS relojes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_relojes_marca
ON relojes(marca);


CREATE INDEX IF NOT EXISTS idx_relojes_categoria
ON relojes(categoria);