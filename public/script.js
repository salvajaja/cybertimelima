// =========================================================
// CYBERTIMELIMA
// SCRIPT PRINCIPAL
// =========================================================

const API = "/api";

const WHATSAPP_NUMBER = "51987348266";


// =========================================================
// CATEGORÍAS PREDEFINIDAS
// =========================================================

const CATEGORIAS = [
    "Clásico",
    "Deportivo",
    "Lujo",
    "Smartwatch",
    "Vintage"
];


// =========================================================
// ESTADO
// =========================================================

const appState = {
    loggedInUser: null,
    relojes: [],
    currentReservation: null,
    editingRelojId: null,
    searchTimer: null,
    loadingRelojes: false
};


// =========================================================
// ELEMENTOS
// =========================================================

const bienvenida =
    document.getElementById("bienvenida");

const loginButton =
    document.getElementById("loginButton");

const adminButton =
    document.getElementById("adminButton");

const logoutButton =
    document.getElementById("logoutButton");


const loginModal =
    document.getElementById("loginModal");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");


const detailModal =
    document.getElementById("detailModal");

const detalleContenido =
    document.getElementById("detalleContenido");


const adminModal =
    document.getElementById("adminModal");

const adminRelojes =
    document.getElementById("adminRelojes");

const nuevoRelojButton =
    document.getElementById("nuevoRelojButton");


const relojFormModal =
    document.getElementById("relojFormModal");

const relojForm =
    document.getElementById("relojForm");

const relojFormTitulo =
    document.getElementById("relojFormTitulo");

const relojFormError =
    document.getElementById("relojFormError");

const guardarRelojButton =
    document.getElementById("guardarRelojButton");


const relojId =
    document.getElementById("relojId");

const relojNombre =
    document.getElementById("relojNombre");

const relojMarca =
    document.getElementById("relojMarca");

const relojCategoria =
    document.getElementById("relojCategoria");

const relojPrecio =
    document.getElementById("relojPrecio");

const relojStock =
    document.getElementById("relojStock");

const relojDescripcion =
    document.getElementById("relojDescripcion");

const relojImagen =
    document.getElementById("relojImagen");


const imagenPreviewContainer =
    document.getElementById(
        "imagenPreviewContainer"
    );

const imagenPreview =
    document.getElementById(
        "imagenPreview"
    );

const imagenActual =
    document.getElementById(
        "imagenActual"
    );


const relojesContainer =
    document.getElementById(
        "relojesContainer"
    );

const sinResultados =
    document.getElementById(
        "sinResultados"
    );


const buscar =
    document.getElementById(
        "buscar"
    );

const filtroMarca =
    document.getElementById(
        "filtroMarca"
    );

const filtroCategoria =
    document.getElementById(
        "filtroCategoria"
    );

const ordenar =
    document.getElementById(
        "ordenar"
    );


const whatsappButton =
    document.getElementById(
        "whatsappButton"
    );


// =========================================================
// INICIO
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    configurarEventos();

    configurarWhatsApp();

    configurarCategorias();

    await comprobarSesion();

    await cargarRelojes();
}


// =========================================================
// CONFIGURAR CATEGORÍAS
// =========================================================

function configurarCategorias() {

    // -----------------------------------------------------
    // FILTRO DEL CLIENTE
    // -----------------------------------------------------

    if (filtroCategoria) {

        const categoriaActual =
            filtroCategoria.value;

        filtroCategoria.innerHTML = `
            <option value="">
                Todas las categorías
            </option>
        `;

        CATEGORIAS.forEach(
            categoria => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    categoria;

                option.textContent =
                    categoria;

                if (
                    categoria ===
                    categoriaActual
                ) {
                    option.selected =
                        true;
                }

                filtroCategoria.appendChild(
                    option
                );

            }
        );

    }


    // -----------------------------------------------------
    // SELECT DEL ADMINISTRADOR
    // -----------------------------------------------------

    if (relojCategoria) {

        const categoriaActual =
            relojCategoria.value;

        relojCategoria.innerHTML = `
            <option value="">
                Seleccionar categoría
            </option>
        `;

        CATEGORIAS.forEach(
            categoria => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    categoria;

                option.textContent =
                    categoria;

                if (
                    categoria ===
                    categoriaActual
                ) {
                    option.selected =
                        true;
                }

                relojCategoria.appendChild(
                    option
                );

            }
        );

    }

}


// =========================================================
// EVENTOS
// =========================================================

function configurarEventos() {

    // -----------------------------------------------------
    // LOGIN
    // -----------------------------------------------------

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => abrirModal("loginModal")
        );

    }


    // -----------------------------------------------------
    // GESTIONAR RELOJES
    // -----------------------------------------------------

    if (adminButton) {

        adminButton.addEventListener(
            "click",
            abrirPanelAdmin
        );

    }


    // -----------------------------------------------------
    // LOGOUT
    // -----------------------------------------------------

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            cerrarSesion
        );

    }


    // -----------------------------------------------------
    // LOGIN FORM
    // -----------------------------------------------------

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            iniciarSesion
        );

    }


    // -----------------------------------------------------
    // NUEVO RELOJ
    // -----------------------------------------------------

    if (nuevoRelojButton) {

        nuevoRelojButton.addEventListener(
            "click",
            abrirFormularioNuevoReloj
        );

    }


    // -----------------------------------------------------
    // FORMULARIO RELOJ
    // -----------------------------------------------------

    if (relojForm) {

        relojForm.addEventListener(
            "submit",
            guardarReloj
        );

    }


    // -----------------------------------------------------
    // IMAGEN
    // -----------------------------------------------------

    if (relojImagen) {

        relojImagen.addEventListener(
            "change",
            previsualizarImagen
        );

    }


    // -----------------------------------------------------
    // BÚSQUEDA
    // -----------------------------------------------------

    if (buscar) {

        buscar.addEventListener(
            "input",
            manejarBusqueda
        );

    }


    // -----------------------------------------------------
    // FILTRO MARCA
    // -----------------------------------------------------

    if (filtroMarca) {

        filtroMarca.addEventListener(
            "change",
            () => cargarRelojes()
        );

    }


    // -----------------------------------------------------
    // FILTRO CATEGORÍA
    // -----------------------------------------------------

    if (filtroCategoria) {

        filtroCategoria.addEventListener(
            "change",
            () => cargarRelojes()
        );

    }


    // -----------------------------------------------------
    // ORDENAR
    // -----------------------------------------------------

    if (ordenar) {

        ordenar.addEventListener(
            "change",
            () => cargarRelojes()
        );

    }


    // -----------------------------------------------------
    // CERRAR MODALES
    // -----------------------------------------------------

    document.addEventListener(
        "click",
        manejarClickGlobal
    );


    // -----------------------------------------------------
    // ESCAPE
    // -----------------------------------------------------

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            const modalAbierto =
                document.querySelector(
                    ".modal:not(.hidden)"
                );

            if (modalAbierto) {

                cerrarModal(
                    modalAbierto.id
                );

            }

        }
    );


    // -----------------------------------------------------
    // CATÁLOGO
    // -----------------------------------------------------

    if (relojesContainer) {

        relojesContainer.addEventListener(
            "click",
            manejarClickCatalogo
        );

    }


    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    if (adminRelojes) {

        adminRelojes.addEventListener(
            "click",
            manejarClickAdmin
        );

    }

}


// =========================================================
// BÚSQUEDA CON DEBOUNCE
// =========================================================

function manejarBusqueda() {

    clearTimeout(
        appState.searchTimer
    );

    appState.searchTimer =
        setTimeout(
            () => {
                cargarRelojes();
            },
            300
        );

}


// =========================================================
// CLICK GLOBAL
// =========================================================

function manejarClickGlobal(event) {

    const closeButton =
        event.target.closest(
            "[data-close]"
        );

    if (!closeButton) {
        return;
    }

    cerrarModal(
        closeButton.dataset.close
    );

}


// =========================================================
// CLICK CATÁLOGO
// =========================================================

function manejarClickCatalogo(event) {

    const button =
        event.target.closest(
            "[data-reloj-id]"
        );

    if (!button) {
        return;
    }

    const id =
        Number(
            button.dataset.relojId
        );

    if (!id) {
        return;
    }

    mostrarDetalle(id);

}


// =========================================================
// CLICK ADMIN
// =========================================================

function manejarClickAdmin(event) {

    const editButton =
        event.target.closest(
            "[data-editar-id]"
        );

    if (editButton) {

        editarReloj(
            Number(
                editButton.dataset.editarId
            )
        );

        return;
    }


    const deleteButton =
        event.target.closest(
            "[data-eliminar-id]"
        );

    if (deleteButton) {

        eliminarReloj(
            Number(
                deleteButton.dataset.eliminarId
            )
        );

    }

}


// =========================================================
// MODALES
// =========================================================

function abrirModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function cerrarModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );


    const hayModalesAbiertos =
        document.querySelector(
            ".modal:not(.hidden)"
        );


    if (!hayModalesAbiertos) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// =========================================================
// SESIÓN
// =========================================================

async function comprobarSesion() {

    try {

        const response =
            await fetch(
                `${API}/me`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            appState.loggedInUser =
                null;

            actualizarInterfazAdmin();

            return;
        }


        const data =
            await response.json();


        appState.loggedInUser =
            data.usuario;


        actualizarInterfazAdmin();


    } catch (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );


        appState.loggedInUser =
            null;


        actualizarInterfazAdmin();

    }

}


// =========================================================
// LOGIN
// =========================================================

async function iniciarSesion(event) {

    event.preventDefault();


    if (loginError) {

        loginError.textContent =
            "";

    }


    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    try {

        const response =
            await fetch(
                `${API}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        const data =
            await leerRespuesta(response);


        if (!response.ok) {

            if (loginError) {

                loginError.textContent =
                    data.error ||
                    "No se pudo iniciar sesión.";

            }

            return;

        }


        appState.loggedInUser =
            data.usuario;


        actualizarInterfazAdmin();


        cerrarModal(
            "loginModal"
        );


        if (loginForm) {
            loginForm.reset();
        }


        if (loginError) {
            loginError.textContent = "";
        }


        await cargarRelojes();


        abrirPanelAdmin();


    } catch (error) {

        console.error(
            "Error de login:",
            error
        );


        if (loginError) {

            loginError.textContent =
                error.message ||
                "No se pudo conectar con el servidor.";

        }

    }

}


// =========================================================
// LEER RESPUESTA DEL SERVIDOR
// =========================================================

async function leerRespuesta(response) {

    const texto =
        await response.text();

    if (!texto) {
        return {};
    }

    try {

        return JSON.parse(texto);

    } catch {

        return {
            error: texto
        };

    }

}


// =========================================================
// ABRIR PANEL ADMIN
// =========================================================

async function abrirPanelAdmin() {

    if (!appState.loggedInUser) {

        abrirModal(
            "loginModal"
        );

        return;

    }


    await cargarRelojes();


    abrirModal(
        "adminModal"
    );

}


// =========================================================
// LOGOUT
// =========================================================

async function cerrarSesion() {

    try {

        await fetch(
            `${API}/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );


    } catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    } finally {

        appState.loggedInUser =
            null;


        actualizarInterfazAdmin();


        cerrarModal(
            "adminModal"
        );


        cerrarModal(
            "relojFormModal"
        );

    }

}


// =========================================================
// INTERFAZ ADMIN
// =========================================================

function actualizarInterfazAdmin() {

    const estaLogueado =
        Boolean(
            appState.loggedInUser
        );


    if (
        bienvenida &&
        loginButton &&
        adminButton &&
        logoutButton
    ) {

        if (estaLogueado) {

            bienvenida.textContent =
                `Hola, ${appState.loggedInUser.nombre}`;

            bienvenida.classList.remove(
                "hidden"
            );

            loginButton.classList.add(
                "hidden"
            );

            adminButton.classList.remove(
                "hidden"
            );

            logoutButton.classList.remove(
                "hidden"
            );


        } else {

            bienvenida.textContent =
                "";

            bienvenida.classList.add(
                "hidden"
            );

            loginButton.classList.remove(
                "hidden"
            );

            adminButton.classList.add(
                "hidden"
            );

            logoutButton.classList.add(
                "hidden"
            );

        }

    }

}


// =========================================================
// CARGAR RELOJES
// =========================================================

async function cargarRelojes() {

    if (appState.loadingRelojes) {
        return;
    }


    appState.loadingRelojes =
        true;


    try {

        const params =
            new URLSearchParams();


        const texto =
            buscar
                ? buscar.value.trim()
                : "";


        const marca =
            filtroMarca
                ? filtroMarca.value
                : "";


        const categoria =
            filtroCategoria
                ? filtroCategoria.value
                : "";


        const orden =
            ordenar
                ? ordenar.value
                : "";


        if (texto) {

            params.set(
                "buscar",
                texto
            );

        }


        if (marca) {

            params.set(
                "marca",
                marca
            );

        }


        if (categoria) {

            params.set(
                "categoria",
                categoria
            );

        }


        if (orden) {

            params.set(
                "ordenar",
                orden
            );

        }


        const query =
            params.toString();


        const url =
            query
                ? `${API}/relojes?${query}`
                : `${API}/relojes`;


        const response =
            await fetch(url);


        const data =
            await leerRespuesta(response);


        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudieron cargar los relojes."
            );

        }


        appState.relojes =
            Array.isArray(data)
                ? data
                : [];


        /*
         * IMPORTANTE:
         *
         * Ya NO llamamos actualizarFiltros()
         * porque las categorías son predefinidas.
         *
         * Solo actualizamos las marcas.
         */

        actualizarFiltroMarcas();


        renderizarRelojes();


        if (appState.loggedInUser) {

            renderizarAdminRelojes();

        }


    } catch (error) {

        console.error(
            "Error cargando relojes:",
            error
        );


        if (relojesContainer) {

            relojesContainer.innerHTML = `
                <div class="error-box">
                    No se pudieron cargar los relojes.
                </div>
            `;

        }


    } finally {

        appState.loadingRelojes =
            false;

    }

}


// =========================================================
// ACTUALIZAR SOLO MARCAS
// =========================================================

function actualizarFiltroMarcas() {

    if (!filtroMarca) {
        return;
    }


    const marcaActual =
        filtroMarca.value;


    const marcas =
        [
            ...new Set(
                appState.relojes
                    .map(
                        reloj =>
                            reloj.marca
                    )
                    .filter(Boolean)
            )
        ].sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "es"
                )
        );


    filtroMarca.innerHTML = `
        <option value="">
            Todas las marcas
        </option>
    `;


    const fragment =
        document.createDocumentFragment();


    marcas.forEach(
        marca => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                marca;


            option.textContent =
                marca;


            if (
                marca ===
                marcaActual
            ) {

                option.selected =
                    true;

            }


            fragment.appendChild(
                option
            );

        }
    );


    filtroMarca.appendChild(
        fragment
    );

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escapeHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================================================
// IMAGEN
// =========================================================

function obtenerImagen(reloj) {

    if (
        reloj &&
        reloj.imagen
    ) {

        return reloj.imagen;

    }

    return "";

}


// =========================================================
// RENDERIZAR CATÁLOGO
// =========================================================

function renderizarRelojes() {

    if (!relojesContainer) {
        return;
    }


    relojesContainer.innerHTML =
        "";


    if (
        !appState.relojes ||
        appState.relojes.length === 0
    ) {

        if (sinResultados) {

            sinResultados.classList.remove(
                "hidden"
            );

        }

        return;

    }


    if (sinResultados) {

        sinResultados.classList.add(
            "hidden"
        );

    }


    const fragment =
        document.createDocumentFragment();


    appState.relojes.forEach(
        reloj => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "reloj-card";


            const imagen =
                obtenerImagen(
                    reloj
                );


            const imagenHTML =
                imagen
                    ? `
                        <img
                            src="${escapeHTML(imagen)}"
                            alt="${escapeHTML(reloj.nombre)}"
                            loading="lazy"
                            decoding="async"
                        >
                    `
                    : `
                        <div class="reloj-placeholder">
                            ⌚
                        </div>
                    `;


            card.innerHTML = `

                <div class="reloj-imagen">

                    ${imagenHTML}

                </div>


                <div class="reloj-info">

                    <p class="reloj-marca">
                        ${escapeHTML(
                            reloj.marca
                        )}
                    </p>


                    <h3 class="reloj-nombre">
                        ${escapeHTML(
                            reloj.nombre
                        )}
                    </h3>


                    <p class="reloj-categoria">
                        ${escapeHTML(
                            reloj.categoria
                        )}
                    </p>


                    <p class="reloj-descripcion">
                        ${escapeHTML(
                            reloj.descripcion ||
                            ""
                        )}
                    </p>


                    <div class="reloj-bottom">

                        <strong class="reloj-precio">
                            S/.
                            ${Number(
                                reloj.precio
                            ).toFixed(2)}
                        </strong>


                        <button
                            type="button"
                            class="btn btn-outline btn-small"
                            data-reloj-id="${Number(reloj.id)}"
                        >
                            Ver detalle
                        </button>

                    </div>

                </div>

            `;


            fragment.appendChild(
                card
            );

        }
    );


    relojesContainer.appendChild(
        fragment
    );

}


// =========================================================
// DETALLE
// =========================================================

async function mostrarDetalle(id) {

    try {

        const response =
            await fetch(
                `${API}/relojes/${id}`
            );


        const data =
            await leerRespuesta(response);


        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo obtener el reloj."
            );

        }


        const reloj =
            data;


        const imagen =
            obtenerImagen(
                reloj
            );


        const imagenHTML =
            imagen
                ? `
                    <img
                        src="${escapeHTML(imagen)}"
                        alt="${escapeHTML(reloj.nombre)}"
                        decoding="async"
                    >
                `
                : `
                    <div class="reloj-placeholder">
                        ⌚
                    </div>
                `;


        if (detalleContenido) {

            detalleContenido.innerHTML = `

                <div class="detalle-layout">

                    <div class="detalle-imagen">

                        ${imagenHTML}

                    </div>


                    <div class="detalle-info">

                        <p class="eyebrow">
                            ${escapeHTML(
                                reloj.marca
                            )}
                        </p>


                        <h2>
                            ${escapeHTML(
                                reloj.nombre
                            )}
                        </h2>


                        <p>
                            ${escapeHTML(
                                reloj.categoria
                            )}
                        </p>


                        <div class="detalle-precio">
                            S/.
                            ${Number(
                                reloj.precio
                            ).toFixed(2)}
                        </div>


                        <p>
                            ${escapeHTML(
                                reloj.descripcion ||
                                "Sin descripción."
                            )}
                        </p>


                        <p class="detalle-stock">
                            Stock disponible:
                            <strong>
                                ${
                                    Number(
                                        reloj.stock
                                    ) || 0
                                }
                            </strong>
                        </p>

                    </div>

                </div>

            `;

        }


        abrirModal(
            "detailModal"
        );


    } catch (error) {

        console.error(
            "Error mostrando detalle:",
            error
        );


        alert(
            error.message ||
            "No se pudo cargar el detalle del reloj."
        );

    }

}


// =========================================================
// PANEL ADMIN
// =========================================================

function renderizarAdminRelojes() {

    if (!adminRelojes) {
        return;
    }


    if (
        !appState.relojes ||
        appState.relojes.length === 0
    ) {

        adminRelojes.innerHTML = `
            <div class="empty-admin">
                No hay relojes registrados.
            </div>
        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    appState.relojes.forEach(
        reloj => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-item";


            const imagen =
                obtenerImagen(
                    reloj
                );


            const imagenHTML =
                imagen
                    ? `
                        <img
                            src="${escapeHTML(imagen)}"
                            alt="${escapeHTML(reloj.nombre)}"
                            loading="lazy"
                            decoding="async"
                        >
                    `
                    : `
                        <div class="reloj-placeholder">
                            ⌚
                        </div>
                    `;


            item.innerHTML = `

                <div class="admin-item-image">

                    ${imagenHTML}

                </div>


                <div class="admin-item-info">

                    <strong>
                        ${escapeHTML(
                            reloj.nombre
                        )}
                    </strong>


                    <span>
                        ${escapeHTML(
                            reloj.marca
                        )}
                    </span>


                    <span>
                        ${escapeHTML(
                            reloj.categoria
                        )}
                    </span>


                    <span>
                        S/.
                        ${Number(
                            reloj.precio
                        ).toFixed(2)}
                    </span>

                </div>


                <div class="admin-item-actions">

                    <button
                        type="button"
                        class="btn btn-outline btn-small"
                        data-editar-id="${Number(reloj.id)}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger btn-small"
                        data-eliminar-id="${Number(reloj.id)}"
                    >
                        Eliminar
                    </button>

                </div>

            `;


            fragment.appendChild(
                item
            );

        }
    );


    adminRelojes.innerHTML =
        "";


    adminRelojes.appendChild(
        fragment
    );

}


// =========================================================
// NUEVO RELOJ
// =========================================================

function abrirFormularioNuevoReloj() {

    appState.editingRelojId =
        null;


    if (relojForm) {

        relojForm.reset();

    }


    if (relojId) {

        relojId.value =
            "";

    }


    // Volver a cargar las categorías
    // por seguridad después del reset.

    configurarCategorias();


    if (relojFormTitulo) {

        relojFormTitulo.textContent =
            "Agregar reloj";

    }


    if (guardarRelojButton) {

        guardarRelojButton.textContent =
            "Guardar reloj";

    }


    if (relojFormError) {

        relojFormError.textContent =
            "";

    }


    if (imagenActual) {

        imagenActual.textContent =
            "";

    }


    if (imagenPreview) {

        imagenPreview.src =
            "";

    }


    if (imagenPreviewContainer) {

        imagenPreviewContainer.classList.add(
            "hidden"
        );

    }


    abrirModal(
        "relojFormModal"
    );

}


// =========================================================
// PREVISUALIZAR IMAGEN
// =========================================================

function previsualizarImagen() {

    if (
        !relojImagen ||
        !relojImagen.files ||
        !relojImagen.files[0]
    ) {

        if (imagenPreview) {
            imagenPreview.src = "";
        }

        if (imagenPreviewContainer) {

            imagenPreviewContainer.classList.add(
                "hidden"
            );

        }

        return;

    }


    const archivo =
        relojImagen.files[0];


    const tiposPermitidos = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];


    if (
        !tiposPermitidos.includes(
            archivo.type
        )
    ) {

        relojImagen.value =
            "";


        if (imagenPreviewContainer) {

            imagenPreviewContainer.classList.add(
                "hidden"
            );

        }


        if (relojFormError) {

            relojFormError.textContent =
                "Selecciona una imagen PNG, JPG, JPEG o WEBP.";

        }


        return;

    }


    if (
        archivo.size >
        5 * 1024 * 1024
    ) {

        relojImagen.value =
            "";


        if (imagenPreviewContainer) {

            imagenPreviewContainer.classList.add(
                "hidden"
            );

        }


        if (relojFormError) {

            relojFormError.textContent =
                "La imagen no puede pesar más de 5 MB.";

        }


        return;

    }


    if (relojFormError) {

        relojFormError.textContent =
            "";

    }


    const lector =
        new FileReader();


    lector.onload =
        event => {

            if (imagenPreview) {

                imagenPreview.src =
                    event.target.result;

            }


            if (imagenPreviewContainer) {

                imagenPreviewContainer.classList.remove(
                    "hidden"
                );

            }

        };


    lector.readAsDataURL(
        archivo
    );

}


// =========================================================
// EDITAR RELOJ
// =========================================================

function editarReloj(id) {

    const reloj =
        appState.relojes.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!reloj) {
        return;
    }


    appState.editingRelojId =
        reloj.id;


    relojId.value =
        reloj.id;


    relojNombre.value =
        reloj.nombre || "";


    relojMarca.value =
        reloj.marca || "";


    // -----------------------------------------------------
    // CATEGORÍA
    // -----------------------------------------------------

    configurarCategorias();


    const categoriaEncontrada =
        CATEGORIAS.find(
            categoria =>
                categoria.toLowerCase() ===
                String(
                    reloj.categoria || ""
                ).toLowerCase()
        );


    relojCategoria.value =
        categoriaEncontrada || "";


    relojPrecio.value =
        reloj.precio || "";


    relojStock.value =
        reloj.stock || 0;


    relojDescripcion.value =
        reloj.descripcion || "";


    relojImagen.value =
        "";


    relojFormTitulo.textContent =
        "Editar reloj";


    guardarRelojButton.textContent =
        "Guardar cambios";


    relojFormError.textContent =
        "";


    if (reloj.imagen) {

        imagenActual.textContent =
            "Este reloj ya tiene una imagen. " +
            "Selecciona otra solamente si deseas reemplazarla.";


        imagenPreview.src =
            reloj.imagen;


        imagenPreviewContainer.classList.remove(
            "hidden"
        );


    } else {

        imagenActual.textContent =
            "Este reloj no tiene una imagen.";


        imagenPreview.src =
            "";


        imagenPreviewContainer.classList.add(
            "hidden"
        );

    }


    abrirModal(
        "relojFormModal"
    );

}


// =========================================================
// GUARDAR RELOJ
// =========================================================

async function guardarReloj(event) {

    event.preventDefault();


    if (relojFormError) {

        relojFormError.textContent =
            "";

    }


    if (!appState.loggedInUser) {

        if (relojFormError) {

            relojFormError.textContent =
                "Debes iniciar sesión como administrador.";

        }

        return;

    }


    const nombre =
        relojNombre.value.trim();


    const marca =
        relojMarca.value.trim();


    const categoria =
        relojCategoria.value;


    const precio =
        relojPrecio.value;


    const stock =
        relojStock.value;


    const descripcion =
        relojDescripcion.value.trim();


    // -----------------------------------------------------
    // VALIDAR CATEGORÍA
    // -----------------------------------------------------

    if (
        !CATEGORIAS.includes(
            categoria
        )
    ) {

        if (relojFormError) {

            relojFormError.textContent =
                "Debes seleccionar una categoría válida.";

        }

        return;

    }


    if (
        !nombre ||
        !marca ||
        !precio
    ) {

        if (relojFormError) {

            relojFormError.textContent =
                "Completa los campos obligatorios.";

        }

        return;

    }


    const precioNumero =
        Number(precio);


    if (
        !Number.isFinite(
            precioNumero
        ) ||
        precioNumero < 0
    ) {

        if (relojFormError) {

            relojFormError.textContent =
                "Ingresa un precio válido.";

        }

        return;

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

        if (relojFormError) {

            relojFormError.textContent =
                "Ingresa un stock válido.";

        }

        return;

    }


    // -----------------------------------------------------
    // FORM DATA
    // -----------------------------------------------------

    const datos =
        new FormData();


    datos.append(
        "nombre",
        nombre
    );


    datos.append(
        "marca",
        marca
    );


    datos.append(
        "categoria",
        categoria
    );


    datos.append(
        "precio",
        precio
    );


    datos.append(
        "stock",
        stock || "0"
    );


    datos.append(
        "descripcion",
        descripcion
    );


    if (
        relojImagen &&
        relojImagen.files &&
        relojImagen.files.length > 0
    ) {

        datos.append(
            "imagen",
            relojImagen.files[0]
        );

    }


    const id =
        appState.editingRelojId;


    const esEdicion =
        Boolean(id);


    const url =
        esEdicion
            ? `${API}/relojes/${id}`
            : `${API}/relojes`;


    try {

        guardarRelojButton.disabled =
            true;


        guardarRelojButton.textContent =
            esEdicion
                ? "Guardando..."
                : "Agregando...";


        console.log(
            "📤 Enviando reloj:",
            {
                nombre,
                marca,
                categoria,
                precio,
                stock,
                tieneImagen:
                    Boolean(
                        relojImagen &&
                        relojImagen.files &&
                        relojImagen.files.length
                    )
            }
        );


        const response =
            await fetch(
                url,
                {
                    method:
                        esEdicion
                            ? "PUT"
                            : "POST",

                    credentials:
                        "include",

                    body:
                        datos
                }
            );


        const resultado =
            await leerRespuesta(
                response
            );


        console.log(
            "📥 Respuesta del servidor:",
            resultado
        );


        if (!response.ok) {
    let resultadoError;

    try {
        resultadoError = await response.json();
    } catch {
        resultadoError = null;
    }

    throw new Error(
        resultadoError?.error ||
        resultadoError?.detalle ||
        `Error del servidor (${response.status})`
    );
}


        // -------------------------------------------------
        // ÉXITO
        // -------------------------------------------------

        if (relojForm) {

            relojForm.reset();

        }


        appState.editingRelojId =
            null;


        cerrarModal(
            "relojFormModal"
        );


        await cargarRelojes();


        alert(
            esEdicion
                ? "Reloj actualizado correctamente."
                : "Reloj agregado correctamente."
        );


    } catch (error) {

        console.error(
            "❌ Error guardando reloj:",
            error
        );


        if (relojFormError) {

            relojFormError.textContent =
                error.message ||
                "No se pudo guardar el reloj.";

        }


    } finally {

        guardarRelojButton.disabled =
            false;


        guardarRelojButton.textContent =
            esEdicion
                ? "Guardar cambios"
                : "Guardar reloj";

    }

}


// =========================================================
// ELIMINAR RELOJ
// =========================================================

async function eliminarReloj(id) {

    if (!appState.loggedInUser) {

        alert(
            "Debes iniciar sesión como administrador."
        );

        return;

    }


    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este reloj?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/relojes/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        const data =
            await leerRespuesta(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "No se pudo eliminar el reloj."
            );

        }


        await cargarRelojes();


        alert(
            "Reloj eliminado correctamente."
        );


    } catch (error) {

        console.error(
            "Error eliminando reloj:",
            error
        );


        alert(
            error.message ||
            "No se pudo eliminar el reloj."
        );

    }

}


// =========================================================
// WHATSAPP
// =========================================================

function configurarWhatsApp() {

    if (!whatsappButton) {
        return;
    }


    whatsappButton.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(
            "Hola, quisiera obtener información sobre los relojes de CyberTimeLima."
        );

}


// =========================================================
// FUNCIONES DISPONIBLES PARA HTML
// =========================================================

window.mostrarDetalle =
    mostrarDetalle;

window.editarReloj =
    editarReloj;

window.eliminarReloj =
    eliminarReloj;