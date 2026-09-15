require("dotenv").config();

const pool = require("./db");

async function probarConexion() {
    try {
        console.log("==========================================");
        console.log("       PRUEBA DE BASE DE DATOS");
        console.log("==========================================");

        // Comprobar DATABASE_URL
        console.log(
            "DATABASE_URL existe:",
            !!process.env.DATABASE_URL
        );

        // Mostrar host y puerto sin mostrar la contraseña
        const url = new URL(process.env.DATABASE_URL);

        console.log(
            "Host configurado:",
            url.hostname
        );

        console.log(
            "Puerto configurado:",
            url.port
        );

        console.log("------------------------------------------");

        // 1. Probar conexión
        const resultado = await pool.query(
            "SELECT NOW() AS hora"
        );

        console.log(
            "✅ Conexión exitosa con Aiven PostgreSQL"
        );

        console.log(
            "Hora del servidor:",
            resultado.rows[0].hora
        );

        console.log("------------------------------------------");

        // 2. Comprobar que existe la tabla relojes
        const tabla = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'relojes'
            ) AS existe
        `);

        if (tabla.rows[0].existe) {
            console.log("✅ La tabla 'relojes' existe");
        } else {
            console.log("❌ La tabla 'relojes' NO existe");
            return;
        }

        console.log("------------------------------------------");

        // 3. Mostrar las columnas de la tabla relojes
        const columnas = await pool.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'relojes'
            ORDER BY ordinal_position
        `);

        console.log("📋 Columnas de la tabla 'relojes':");

        columnas.rows.forEach((columna) => {
            console.log(
                `   - ${columna.column_name} (${columna.data_type})`
            );
        });

        console.log("------------------------------------------");

        // 4. Intentar leer los relojes
        const relojes = await pool.query(
            "SELECT * FROM relojes ORDER BY id DESC"
        );

        console.log(
            "✅ SELECT * FROM relojes ejecutado correctamente"
        );

        console.log(
            "Cantidad de relojes:",
            relojes.rows.length
        );

        console.log(
            "Relojes encontrados:",
            relojes.rows
        );

        console.log("------------------------------------------");

        // 5. Contar relojes
        const cantidad = await pool.query(
            "SELECT COUNT(*) AS total FROM relojes"
        );

        console.log(
            "📊 Total de relojes en la base de datos:",
            cantidad.rows[0].total
        );

        console.log("==========================================");
        console.log("       PRUEBA TERMINADA CORRECTAMENTE");
        console.log("==========================================");

    } catch (error) {

        console.log("==========================================");
        console.log("       ❌ ERROR EN LA PRUEBA");
        console.log("==========================================");

        console.error("Mensaje:", error.message);
        console.error("Código:", error.code);
        console.error("Detalle:", error.detail);
        console.error("Tabla:", error.table);
        console.error("Columna:", error.column);
        console.error("Constraint:", error.constraint);

        console.log("------------------------------------------");
        console.error("STACK COMPLETO:");
        console.error(error.stack);

        console.log("==========================================");

    } finally {
        await pool.end();
    }
}

probarConexion();