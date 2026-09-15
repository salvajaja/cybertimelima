require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET;

// =========================================================
// CATEGORÍAS
// =========================================================

const CATEGORIAS = [
    "Clásico",
    "Deportivo",
    "Lujo",
    "Smartwatch",
    "Vintage"
];

// =========================================================
// MULTER
// =========================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const tiposPermitidos = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Solo se permiten imágenes PNG, JPG, JPEG o WEBP."
                )
            );
        }
    }
});

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// =========================================================
// AUTENTICACIÓN
// =========================================================

function crearToken(usuario) {

    return jwt.sign(
        {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

// =========================================================
// MIDDLEWARE AUTENTICAR
// =========================================================

function autenticar(req, res, next) {

    try {

        const token =
            req.cookies.token;

        if (!token) {

            return res.status(401).json({
                error:
                    "No has iniciado sesión."
            });
        }

        const datos =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.usuario = datos;

        next();

    } catch (error) {

        console.error(
            "❌ Error verificando token:",
            error.message
        );

        return res.status(401).json({
            error:
                "Sesión inválida o expirada."
        });
    }
}

// =========================================================
// SOLO ADMIN
// =========================================================

function soloAdmin(req, res, next) {

    if (
        !req.usuario ||
        req.usuario.rol !== "admin"
    ) {

        return res.status(403).json({
            error:
                "Solo el administrador puede realizar esta acción."
        });
    }

    next();
}

// =========================================================
// LOGIN
// =========================================================

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (!email || !password) {

                return res.status(400).json({
                    error:
                        "Ingresa correo y contraseña."
                });
            }

            const resultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        nombre,
                        email,
                        password,
                        rol
                    FROM usuarios
                    WHERE LOWER(email) = LOWER($1)
                    LIMIT 1
                    `,
                    [
                        email.trim()
                    ]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(401).json({
                    error:
                        "Correo o contraseña incorrectos."
                });
            }

            const usuario =
                resultado.rows[0];

            const passwordCorrecta =
                await bcrypt.compare(
                    password,
                    usuario.password
                );

            if (!passwordCorrecta) {

                return res.status(401).json({
                    error:
                        "Correo o contraseña incorrectos."
                });
            }

            if (
                usuario.rol !== "admin"
            ) {

                return res.status(403).json({
                    error:
                        "Este usuario no tiene permisos de administrador."
                });
            }

            const token =
                crearToken(usuario);

            res.cookie(
                "token",
                token,
                {
                    httpOnly: true,
                    sameSite: "lax",
                    secure:
                        process.env.NODE_ENV ===
                        "production",
                    maxAge:
                        7 *
                        24 *
                        60 *
                        60 *
                        1000
                }
            );

            return res.json({
                ok: true,

                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });

        } catch (error) {

            console.error(
                "❌ ERROR EN LOGIN"
            );

            console.error(
                "Mensaje:",
                error.message
            );

            console.error(
                "Código:",
                error.code
            );

            console.error(
                "Stack:",
                error.stack
            );

            return res.status(500).json({
                error:
                    "Error interno del servidor."
            });
        }
    }
);

// =========================================================
// LOGOUT
// =========================================================

app.post(
    "/api/logout",
    (req, res) => {

        res.clearCookie(
            "token"
        );

        return res.json({
            ok: true
        });
    }
);

// =========================================================
// COMPROBAR SESIÓN
// =========================================================

app.get(
    "/api/me",
    autenticar,
    (req, res) => {

        return res.json({
            usuario:
                req.usuario
        });
    }
);

// =========================================================
// CATEGORÍAS
// =========================================================

app.get(
    "/api/categorias",
    (req, res) => {

        return res.json(
            CATEGORIAS.map(
                (nombre, index) => ({
                    id: index + 1,
                    nombre
                })
            )
        );
    }
);

// =========================================================
// VALIDAR CATEGORÍA
// =========================================================

function categoriaValida(
    categoria
) {

    if (
        !categoria ||
        typeof categoria !== "string"
    ) {

        return false;
    }

    return CATEGORIAS.some(
        item =>
            item.toLowerCase() ===
            categoria
                .trim()
                .toLowerCase()
    );
}

// =========================================================
// GET TODOS LOS RELOJES
// =========================================================

app.get(
    "/api/relojes",
    async (req, res) => {

        try {

            console.log(
                "📥 GET /api/relojes"
            );

            const {
                buscar = "",
                marca = "",
                categoria = "",
                ordenar = ""
            } = req.query;

            let condiciones = [];
            let valores = [];
            let numeroParametro = 1;

            // -----------------------------------------
            // BUSCAR
            // -----------------------------------------

            if (
                buscar &&
                buscar.trim()
            ) {

                condiciones.push(
                    `
                    (
                        LOWER(nombre)
                        LIKE LOWER($${numeroParametro})

                        OR

                        LOWER(marca)
                        LIKE LOWER($${numeroParametro})

                        OR

                        LOWER(descripcion)
                        LIKE LOWER($${numeroParametro})
                    )
                    `
                );

                valores.push(
                    `%${buscar.trim()}%`
                );

                numeroParametro++;
            }

            // -----------------------------------------
            // MARCA
            // -----------------------------------------

            if (
                marca &&
                marca.trim()
            ) {

                condiciones.push(
                    `
                    LOWER(marca)
                    =
                    LOWER($${numeroParametro})
                    `
                );

                valores.push(
                    marca.trim()
                );

                numeroParametro++;
            }

            // -----------------------------------------
            // CATEGORÍA
            // -----------------------------------------

            if (
                categoria &&
                categoria.trim()
            ) {

                condiciones.push(
                    `
                    LOWER(categoria)
                    =
                    LOWER($${numeroParametro})
                    `
                );

                valores.push(
                    categoria.trim()
                );

                numeroParametro++;
            }

            // -----------------------------------------
            // CONSULTA BASE
            // -----------------------------------------

            let query = `
                SELECT
                    id,
                    nombre,
                    marca,
                    categoria,
                    precio,
                    descripcion,
                    stock,
                    imagen,
                    imagen_mime,
                    creado_en,
                    actualizado_en
                FROM relojes
            `;

            // -----------------------------------------
            // WHERE
            // -----------------------------------------

            if (
                condiciones.length > 0
            ) {

                query += `
                    WHERE
                    ${condiciones.join(
                        " AND "
                    )}
                `;
            }

            // -----------------------------------------
            // ORDENAR
            // -----------------------------------------

            if (
                ordenar ===
                "precio-asc"
            ) {

                query += `
                    ORDER BY precio ASC
                `;

            } else if (
                ordenar ===
                "precio-desc"
            ) {

                query += `
                    ORDER BY precio DESC
                `;

            } else if (
                ordenar === "nombre"
            ) {

                query += `
                    ORDER BY nombre ASC
                `;

            } else if (
                ordenar === "recientes"
            ) {

                query += `
                    ORDER BY creado_en DESC
                `;

            } else {

                query += `
                    ORDER BY id DESC
                `;
            }

            console.log(
                "🔎 Consulta:",
                query
            );

            const resultado =
                await pool.query(
                    query,
                    valores
                );

            const relojes =
                resultado.rows.map(
                    reloj => {

                        const nuevoReloj = {
                            ...reloj
                        };

                        if (
                            reloj.imagen_mime
                        ) {

                            nuevoReloj.imagen =
                                `/api/relojes/${reloj.id}/imagen`;
                        }

                        return nuevoReloj;
                    }
                );

            console.log(
                `✅ ${relojes.length} relojes encontrados`
            );

            return res.json(
                relojes
            );

        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERROR REAL EN GET /api/relojes"
            );

            console.error(
                "Mensaje:",
                error?.message
            );

            console.error(
                "Código:",
                error?.code
            );

            console.error(
                "Detalle:",
                error?.detail
            );

            console.error(
                "Columna:",
                error?.column
            );

            console.error(
                "Tabla:",
                error?.table
            );

            console.error(
                "Stack:",
                error?.stack
            );

            console.error(
                "=========================================="
            );

            return res.status(500).json({
                error:
                    "No se pudieron obtener los relojes.",
                mensaje:
                    error?.message || null,
                codigo:
                    error?.code || null,
                detalle:
                    error?.detail || null
            });
        }
    }
);

// =========================================================
// GET UN RELOJ
// =========================================================

app.get(
    "/api/relojes/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const resultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        nombre,
                        marca,
                        categoria,
                        precio,
                        descripcion,
                        stock,
                        imagen,
                        imagen_mime,
                        creado_en,
                        actualizado_en
                    FROM relojes
                    WHERE id = $1
                    `,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Reloj no encontrado."
                });
            }

            const reloj =
                resultado.rows[0];

            if (
                reloj.imagen_mime
            ) {

                reloj.imagen =
                    `/api/relojes/${reloj.id}/imagen`;
            }

            delete reloj.imagen_mime;

            return res.json(
                reloj
            );

        } catch (error) {

            console.error(
                "❌ ERROR GET RELOJ:",
                error
            );

            return res.status(500).json({
                error:
                    "Error interno del servidor.",
                detalle:
                    error.message
            });
        }
    }
);

// =========================================================
// IMAGEN DE RELOJ
// =========================================================

app.get(
    "/api/relojes/:id/imagen",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const resultado =
                await pool.query(
                    `
                    SELECT
                        imagen_data,
                        imagen_mime
                    FROM relojes
                    WHERE id = $1
                    `,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).send(
                    "Imagen no encontrada."
                );
            }

            const reloj =
                resultado.rows[0];

            if (
                !reloj.imagen_data
            ) {

                return res.status(404).send(
                    "Este reloj no tiene imagen."
                );
            }

            res.setHeader(
                "Content-Type",
                reloj.imagen_mime ||
                "image/jpeg"
            );

            res.setHeader(
                "Cache-Control",
                "public, max-age=86400"
            );

            return res.send(
                reloj.imagen_data
            );

        } catch (error) {

            console.error(
                "❌ ERROR OBTENIENDO IMAGEN:",
                error
            );

            return res.status(500).send(
                "No se pudo cargar la imagen."
            );
        }
    }
);

// =========================================================
// AGREGAR RELOJ
// =========================================================

app.post(
    "/api/relojes",
    autenticar,
    soloAdmin,
    upload.single("imagen"),

    async (req, res) => {

        // =====================================================
        // PRUEBA PARA COMPROBAR QUE EL POST LLEGA
        // =====================================================

        console.log(
            "🔥🔥🔥 POST /api/relojes RECIBIDO 🔥🔥🔥"
        );

        console.log(
            "BODY:",
            req.body
        );

        console.log(
            "FILE:",
            req.file
        );

        console.log(
            "USUARIO:",
            req.usuario
        );

        try {

            const {
                nombre,
                marca,
                categoria,
                precio,
                descripcion,
                stock
            } = req.body;

            console.log(
                "=========================================="
            );

            console.log(
                "📥 DATOS PARA NUEVO RELOJ"
            );

            console.log({
                nombre,
                marca,
                categoria,
                precio,
                descripcion,
                stock,
                tieneImagen:
                    !!req.file
            });

            // -----------------------------------------
            // NOMBRE
            // -----------------------------------------

            if (
                !nombre ||
                !nombre.trim()
            ) {

                return res.status(400).json({
                    error:
                        "El nombre del reloj es obligatorio."
                });
            }

            // -----------------------------------------
            // MARCA
            // -----------------------------------------

            if (
                !marca ||
                !marca.trim()
            ) {

                return res.status(400).json({
                    error:
                        "La marca es obligatoria."
                });
            }

            // -----------------------------------------
            // CATEGORÍA
            // -----------------------------------------

            if (
                !categoria ||
                !categoria.trim()
            ) {

                return res.status(400).json({
                    error:
                        "Debes seleccionar una categoría."
                });
            }

            if (
                !categoriaValida(
                    categoria
                )
            ) {

                return res.status(400).json({
                    error:
                        "La categoría seleccionada no es válida."
                });
            }

            // -----------------------------------------
            // PRECIO
            // -----------------------------------------

            const precioNumero =
                Number(precio);

            if (
                !Number.isFinite(
                    precioNumero
                ) ||
                precioNumero < 0
            ) {

                return res.status(400).json({
                    error:
                        "El precio no es válido."
                });
            }

            // -----------------------------------------
            // STOCK
            // -----------------------------------------

            const stockNumero =
                Number(
                    stock || 0
                );

            if (
                !Number.isInteger(
                    stockNumero
                ) ||
                stockNumero < 0
            ) {

                return res.status(400).json({
                    error:
                        "El stock no es válido."
                });
            }

            // -----------------------------------------
            // IMAGEN
            // -----------------------------------------

            let imagenData = null;
            let imagenMime = null;

            if (req.file) {

                imagenData =
                    req.file.buffer;

                imagenMime =
                    req.file.mimetype;

                console.log(
                    "🖼️ Imagen recibida"
                );

                console.log(
                    "Tipo:",
                    imagenMime
                );

                console.log(
                    "Tamaño:",
                    req.file.size,
                    "bytes"
                );
            } else {

                console.log(
                    "ℹ️ El reloj se guardará SIN imagen."
                );
            }

            // -----------------------------------------
            // INSERT
            // -----------------------------------------

            console.log(
                "📤 Ejecutando INSERT..."
            );

            const resultado =
                await pool.query(
                    `
                    INSERT INTO relojes
                    (
                        nombre,
                        marca,
                        categoria,
                        precio,
                        descripcion,
                        stock,
                        imagen,
                        imagen_data,
                        imagen_mime
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        NULL,
                        $7,
                        $8
                    )
                    RETURNING
                        id,
                        nombre,
                        marca,
                        categoria,
                        precio,
                        descripcion,
                        stock,
                        imagen,
                        imagen_mime,
                        creado_en,
                        actualizado_en
                    `,
                    [
                        nombre.trim(),
                        marca.trim(),
                        categoria.trim(),
                        precioNumero,
                        descripcion
                            ? descripcion.trim()
                            : "",
                        stockNumero,
                        imagenData,
                        imagenMime
                    ]
                );

            console.log(
                "✅ INSERT EJECUTADO"
            );

            const reloj =
                resultado.rows[0];

            if (
                reloj.imagen_mime
            ) {

                reloj.imagen =
                    `/api/relojes/${reloj.id}/imagen`;
            }

            delete reloj.imagen_mime;

            console.log(
                "✅ RELOJ GUARDADO:"
            );

            console.log(
                reloj
            );

            console.log(
                "=========================================="
            );

            return res.status(201).json({
                ok: true,
                mensaje:
                    "Reloj agregado correctamente.",
                reloj
            });

        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "🚨🚨🚨 ERROR REAL DEL POST /api/relojes 🚨🚨🚨"
            );

            console.error(
                "MESSAGE:",
                error?.message
            );

            console.error(
                "CODE:",
                error?.code
            );

            console.error(
                "DETAIL:",
                error?.detail
            );

            console.error(
                "TABLE:",
                error?.table
            );

            console.error(
                "COLUMN:",
                error?.column
            );

            console.error(
                "CONSTRAINT:",
                error?.constraint
            );

            console.error(
                "STACK:",
                error?.stack
            );

            console.error(
                "=========================================="
            );

            return res.status(500).json({
                error:
                    error?.message ||
                    "No se pudo agregar el reloj.",
                codigo:
                    error?.code ||
                    null,
                detalle:
                    error?.detail ||
                    null
            });
        }
    }
);

// =========================================================
// EDITAR RELOJ
// =========================================================

app.put(
    "/api/relojes/:id",
    autenticar,
    soloAdmin,
    upload.single("imagen"),

    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                nombre,
                marca,
                categoria,
                precio,
                descripcion,
                stock
            } = req.body;

            // -----------------------------------------
            // VALIDACIONES
            // -----------------------------------------

            if (
                !nombre ||
                !nombre.trim()
            ) {

                return res.status(400).json({
                    error:
                        "El nombre del reloj es obligatorio."
                });
            }

            if (
                !marca ||
                !marca.trim()
            ) {

                return res.status(400).json({
                    error:
                        "La marca es obligatoria."
                });
            }

            if (
                !categoria ||
                !categoria.trim()
            ) {

                return res.status(400).json({
                    error:
                        "Debes seleccionar una categoría."
                });
            }

            if (
                !categoriaValida(
                    categoria
                )
            ) {

                return res.status(400).json({
                    error:
                        "La categoría seleccionada no es válida."
                });
            }

            const precioNumero =
                Number(precio);

            if (
                !Number.isFinite(
                    precioNumero
                ) ||
                precioNumero < 0
            ) {

                return res.status(400).json({
                    error:
                        "El precio no es válido."
                });
            }

            const stockNumero =
                Number(
                    stock || 0
                );

            if (
                !Number.isInteger(
                    stockNumero
                ) ||
                stockNumero < 0
            ) {

                return res.status(400).json({
                    error:
                        "El stock no es válido."
                });
            }

            // -----------------------------------------
            // COMPROBAR EXISTENCIA
            // -----------------------------------------

            const existe =
                await pool.query(
                    `
                    SELECT id
                    FROM relojes
                    WHERE id = $1
                    `,
                    [id]
                );

            if (
                existe.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Reloj no encontrado."
                });
            }

            let resultado;

            // -----------------------------------------
            // CON IMAGEN NUEVA
            // -----------------------------------------

            if (req.file) {

                resultado =
                    await pool.query(
                        `
                        UPDATE relojes
                        SET
                            nombre = $1,
                            marca = $2,
                            categoria = $3,
                            precio = $4,
                            descripcion = $5,
                            stock = $6,
                            imagen = NULL,
                            imagen_data = $7,
                            imagen_mime = $8,
                            actualizado_en = NOW()
                        WHERE id = $9
                        RETURNING
                            id,
                            nombre,
                            marca,
                            categoria,
                            precio,
                            descripcion,
                            stock,
                            imagen,
                            imagen_mime,
                            creado_en,
                            actualizado_en
                        `,
                        [
                            nombre.trim(),
                            marca.trim(),
                            categoria.trim(),
                            precioNumero,
                            descripcion
                                ? descripcion.trim()
                                : "",
                            stockNumero,
                            req.file.buffer,
                            req.file.mimetype,
                            id
                        ]
                    );

            } else {

                // -----------------------------------------
                // SIN CAMBIAR IMAGEN
                // -----------------------------------------

                resultado =
                    await pool.query(
                        `
                        UPDATE relojes
                        SET
                            nombre = $1,
                            marca = $2,
                            categoria = $3,
                            precio = $4,
                            descripcion = $5,
                            stock = $6,
                            actualizado_en = NOW()
                        WHERE id = $7
                        RETURNING
                            id,
                            nombre,
                            marca,
                            categoria,
                            precio,
                            descripcion,
                            stock,
                            imagen,
                            imagen_mime,
                            creado_en,
                            actualizado_en
                        `,
                        [
                            nombre.trim(),
                            marca.trim(),
                            categoria.trim(),
                            precioNumero,
                            descripcion
                                ? descripcion.trim()
                                : "",
                            stockNumero,
                            id
                        ]
                    );
            }

            const reloj =
                resultado.rows[0];

            if (
                reloj.imagen_mime
            ) {

                reloj.imagen =
                    `/api/relojes/${reloj.id}/imagen`;
            }

            delete reloj.imagen_mime;

            console.log(
                `✅ Reloj ${id} actualizado correctamente.`
            );

            return res.json({
                ok: true,
                mensaje:
                    "Reloj actualizado correctamente.",
                reloj
            });

        } catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "❌ ERROR REAL AL EDITAR RELOJ"
            );

            console.error(
                "Mensaje:",
                error?.message
            );

            console.error(
                "Código:",
                error?.code
            );

            console.error(
                "Detalle:",
                error?.detail
            );

            console.error(
                "Columna:",
                error?.column
            );

            console.error(
                "Stack:",
                error?.stack
            );

            console.error(
                "=========================================="
            );

            return res.status(500).json({
                error:
                    error?.message ||
                    "No se pudo actualizar el reloj.",
                codigo:
                    error?.code ||
                    null,
                detalle:
                    error?.detail ||
                    null
            });
        }
    }
);

// =========================================================
// ELIMINAR RELOJ
// =========================================================

app.delete(
    "/api/relojes/:id",
    autenticar,
    soloAdmin,

    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const resultado =
                await pool.query(
                    `
                    DELETE FROM relojes
                    WHERE id = $1
                    RETURNING id
                    `,
                    [id]
                );

            if (
                resultado.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Reloj no encontrado."
                });
            }

            console.log(
                `🗑️ Reloj ${id} eliminado.`
            );

            return res.json({
                ok: true,
                mensaje:
                    "Reloj eliminado correctamente."
            });

        } catch (error) {

            console.error(
                "❌ ERROR ELIMINANDO RELOJ"
            );

            console.error(
                error
            );

            return res.status(500).json({
                error:
                    error?.message ||
                    "No se pudo eliminar el reloj."
            });
        }
    }
);

// =========================================================
// ERRORES DE MULTER
// =========================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "=========================================="
        );

        console.error(
            "❌ ERROR DE MIDDLEWARE"
        );

        console.error(
            "Mensaje:",
            error?.message
        );

        console.error(
            "Código:",
            error?.code
        );

        console.error(
            "Stack:",
            error?.stack
        );

        console.error(
            "=========================================="
        );

        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    error:
                        "La imagen no puede pesar más de 5 MB."
                });
            }

            return res.status(400).json({
                error:
                    error.message
            });
        }

        if (error) {

            return res.status(400).json({
                error:
                    error.message
            });
        }

        next();
    }
);

// =========================================================
// RUTA PRINCIPAL
// =========================================================

app.use(
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );
    }
);

// =========================================================
// INICIAR SERVIDOR
// =========================================================

async function iniciarServidor() {

    try {

        await pool.query(
            "SELECT NOW()"
        );

        console.log(
            "✅ Conexión con PostgreSQL correcta."
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    `🚀 CyberTimeLima funcionando en puerto ${PORT}`
                );
            }
        );

    } catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "❌ NO SE PUDO CONECTAR CON POSTGRESQL"
        );

        console.error(
            "Mensaje:",
            error.message
        );

        console.error(
            "Código:",
            error.code
        );

        console.error(
            "Detalle:",
            error.detail
        );

        console.error(
            "Stack:",
            error.stack
        );

        console.error(
            "=========================================="
        );

        process.exit(1);
    }
}

iniciarServidor();