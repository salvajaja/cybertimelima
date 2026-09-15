require("dotenv").config();

const pool = require("./db");

async function prepararBaseDeDatos() {
    try {
        console.log("🔄 Preparando base de datos...");

        // =====================================================
        // TABLA USUARIOS
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // =====================================================
        // TABLA RELOJES
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS relojes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                marca VARCHAR(100) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                precio NUMERIC(10,2) NOT NULL,
                descripcion TEXT,
                imagen TEXT,
                stock INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // =====================================================
        // TABLA CATEGORÍAS
        // =====================================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        // =====================================================
        // CATEGORÍAS PREDEFINIDAS
        // =====================================================

        const categorias = [
            "Clásico",
            "Deportivo",
            "Lujo",
            "Smartwatch",
            "Vintage"
        ];

        for (const categoria of categorias) {
            await pool.query(
                `
                INSERT INTO categorias (nombre)
                VALUES ($1)
                ON CONFLICT (nombre) DO NOTHING
                `,
                [categoria]
            );
        }

        // =====================================================
        // COLUMNAS PARA IMÁGENES
        // =====================================================

        await pool.query(`
            ALTER TABLE relojes
            ADD COLUMN IF NOT EXISTS imagen_data BYTEA;
        `);

        await pool.query(`
            ALTER TABLE relojes
            ADD COLUMN IF NOT EXISTS imagen_mime VARCHAR(100);
        `);

        // =====================================================
        // ÍNDICES
        // =====================================================

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_relojes_marca
            ON relojes(marca);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_relojes_categoria
            ON relojes(categoria);
        `);

        console.log("✅ Tabla usuarios preparada.");
        console.log("✅ Tabla relojes preparada.");
        console.log("✅ Tabla categorías preparada.");
        console.log("✅ Categorías predefinidas creadas.");
        console.log("✅ Sistema de imágenes preparado.");
        console.log("✅ Base de datos preparada correctamente.");

    } catch (error) {
        console.error("❌ ERROR PREPARANDO LA BASE DE DATOS:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

prepararBaseDeDatos();