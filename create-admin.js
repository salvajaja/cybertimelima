require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./db");

async function crearAdmin() {
    try {
        console.log("🔄 Intentando crear administrador...");

        const nombre =
            process.env.ADMIN_NAME;

        const email =
            process.env.ADMIN_EMAIL;

        const password =
            process.env.ADMIN_PASSWORD;

        if (!nombre || !email || !password) {
            console.log(
                "❌ Faltan datos del administrador en .env"
            );

            return;
        }

        console.log("Nombre:", nombre);
        console.log("Correo:", email);

        const existente = await pool.query(
            `
            SELECT id
            FROM usuarios
            WHERE email = $1
            `,
            [email]
        );

        if (existente.rows.length > 0) {
            console.log(
                "⚠️ Este administrador ya existe."
            );

            return;
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const resultado = await pool.query(
            `
            INSERT INTO usuarios
            (
                nombre,
                email,
                password,
                rol
            )
            VALUES
            ($1, $2, $3, 'admin')
            RETURNING id, nombre, email, rol
            `,
            [
                nombre,
                email,
                passwordHash
            ]
        );

        console.log(
            "✅ Administrador creado correctamente."
        );

        console.log(
            "ID:",
            resultado.rows[0].id
        );

        console.log(
            "Nombre:",
            resultado.rows[0].nombre
        );

        console.log(
            "Correo:",
            resultado.rows[0].email
        );

        console.log(
            "Rol:",
            resultado.rows[0].rol
        );

    } catch (error) {
        console.error(
            "❌ Error creando administrador:"
        );

        console.error(error);

    } finally {
        await pool.end();
    }
}

crearAdmin();