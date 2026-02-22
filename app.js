// app.js
// Lógica completa del POS Coffeavorous

/* =========================================================
   CONFIGURACIÓN BÁSICA
========================================================= */
const CREDENCIALES = {
  username: "admin",
  password: "1234",
};

const STORAGE_KEYS = {
  CURRENT_SESSION: "POS_CURRENT_SESSION",
  LAST_FOLIO: "POS_LAST_FOLIO",
  DAILY_REPORTS: "POS_DAILY_REPORTS",
};

/* =========================================================
   PRODUCTOS
========================================================= */
const productos = [
  // Café y Té
  { id: 1, nombre: "Té (Variedades)", precio: 2100, categoria: "cafe_te" },
  { id: 2, nombre: "Infusiones", precio: 2100, categoria: "cafe_te" },
  { id: 3, nombre: "Chai Latte", precio: 3900, categoria: "cafe_te" },
  { id: 4, nombre: "Matcha Latte", precio: 4200, categoria: "cafe_te" },
  { id: 5, nombre: "Matcha", precio: 3800, categoria: "cafe_te" },
  { id: 6, nombre: "Chocolate Caliente", precio: 4500, categoria: "cafe_te" },
  { id: 7, nombre: "Ristretto", precio: 2400, categoria: "cafe_te" },
  { id: 8, nombre: "Espresso", precio: 2400, categoria: "cafe_te" },
  { id: 9, nombre: "Lungo", precio: 2400, categoria: "cafe_te" },
  { id: 10, nombre: "Americano", precio: 42400, categoria: "cafe_te" },
  { id: 11, nombre: "Cappuccino", precio: 3400, categoria: "cafe_te" },
  { id: 12, nombre: "latte", precio: 3500, categoria: "cafe_te" },
  { id: 13, nombre: "Macchiato", precio: 2900, categoria: "cafe_te" },
  { id: 14, nombre: "Mocaccino", precio: 4100, categoria: "cafe_te" },
  { id: 15, nombre: "Café de Panthera", precio: 4500, categoria: "cafe_te" },
  { id: 16, nombre: "Café de Puma concolor", precio: 4300, categoria: "cafe_te" },
 


  // Bebidas Frias
  { id: 17, nombre: "Kombucha", precio: 2500, categoria: "bebidas_frias" },
  { id: 18, nombre: "Jugos Naturales", precio: 2700, categoria: "bebidas_frias" },
  { id: 19, nombre: "Agua con Gas", precio: 1900, categoria: "bebidas_frias" },
  { id: 20, nombre: "Agua sin Gas", precio: 1900, categoria: "bebidas_frias" },
  { id: 21, nombre: "Cold Matcha", precio: 3500, categoria: "bebidas_frias" },
  { id: 22, nombre: "Cold Brew", precio: 3500, categoria: "bebidas_frias" },
  { id: 23, nombre: "Pomelo Tónic", precio: 3500, categoria: "bebidas_frias" },
  



  // Dulces y Pasteles
  { id: 24, nombre: "Cheesecake", precio: 4500, categoria: "dulces_pasteles" },
  { id: 25, nombre: "Merengue Frambuesa", precio: 4700, categoria: "dulces_pasteles" },
  { id: 26, nombre: "Milhoja-Manjar", precio: 4200, categoria: "dulces_pasteles" },
  { id: 27, nombre: "Tartaleta", precio: 3700, categoria: "dulces_pasteles" },
  { id: 28, nombre: "Kuchen", precio: 3700, categoria: "dulces_pasteles" },
  { id: 29, nombre: "Pie", precio: 3700, categoria: "dulces_pasteles" },
  { id: 30, nombre: "Churro und", precio: 1500, categoria: "dulces_pasteles" },
  { id: 31, nombre: "Churros 4 und", precio: 4500, categoria: "dulces_pasteles" },
  { id: 32, nombre: "Tiramisú", precio: 3400, categoria: "dulces_pasteles" },
  { id: 33, nombre: "Leche Asada", precio: 2800, categoria: "dulces_pasteles" },

  // Salados y Otros
  { id: 34, nombre: "Sandwich Chacarero (Vegano)", precio: 4700, categoria: "salados_otros" },
  { id: 35, nombre: "Sandwich Capresse (Vegano)", precio: 4500, categoria: "salados_otros" },
  { id: 36, nombre: "Empanaditas", precio: 1400, categoria: "salados_otros" },
  { id: 37, nombre: "Pan de Queso - 3 und", precio: 1750, categoria: "salados_otros" },
  
];

let comandaItems = []; // [{ id, nombre, precio, cantidad }]
let reporteActualParaImprimir = null;

/* =========================================================
   FUNCIONES DE FECHA Y FORMATO
========================================================= */
function hoyISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatearFechaDDMMYYYY(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatearMoneda(valor) {
  return `$${valor.toLocaleString("es-CL")}`;
}

/* =========================================================
   LOCALSTORAGE: SESIONES Y REPORTES
========================================================= */
function cargarSesionActual() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  return data ? JSON.parse(data) : null;
}

function guardarSesionActual(sesion) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sesion));
}

function cargarUltimoFolio() {
  const data = localStorage.getItem(STORAGE_KEYS.LAST_FOLIO);
  return data ? parseInt(data, 10) : 0;
}

function guardarUltimoFolio(folio) {
  localStorage.setItem(STORAGE_KEYS.LAST_FOLIO, String(folio));
}

function cargarHistorialReportes() {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS);
  return data ? JSON.parse(data) : [];
}

function guardarHistorialReportes(lista) {
  localStorage.setItem(STORAGE_KEYS.DAILY_REPORTS, JSON.stringify(lista));
}

function agregarReporteAlHistorial(reporte) {
  const lista = cargarHistorialReportes();
  const filtrada = lista.filter((r) => r.fechaISO !== reporte.fechaISO);
  filtrada.push(reporte);
  guardarHistorialReportes(filtrada);
}

function buscarReportePorFecha(fechaISO) {
  const lista = cargarHistorialReportes();
  return lista.find((r) => r.fechaISO === fechaISO) || null;
}

/* =========================================================
   SESIONES DIARIAS
========================================================= */
function iniciarSesionDeHoy() {
  let sesion = cargarSesionActual();
  const hoy = hoyISO();

  if (sesion && sesion.abierta && sesion.fecha !== hoy) {
    const fechaAnterior = formatearFechaDDMMYYYY(sesion.fecha);
    const cerrar = confirm(
      `Hay una sesión pendiente del día ${fechaAnterior} que no fue cerrada.\n` +
        `Es necesario cerrarla para iniciar una nueva sesión de ventas.\n\n` +
        `¿Deseas cerrar ahora la sesión anterior y generar el reporte diario?`
    );

    if (cerrar) {
      cerrarSesion(sesion);
    } else {
      alert("Debes cerrar la sesión del día anterior para continuar.");
      return;
    }
  }

  sesion = cargarSesionActual();

  if (!sesion || !sesion.abierta) {
    sesion = {
      fecha: hoy,
      abierta: true,
      ventas: [],
    };
    guardarSesionActual(sesion);
  }

  const inputFecha = document.getElementById("reporte-fecha");
  if (inputFecha && !inputFecha.value) {
    inputFecha.value = sesion.fecha;
  }
}

/* =========================================================
   RESUMEN DE SESIÓN Y REPORTES DIARIOS
========================================================= */
function calcularResumenSesion(sesion) {
  const resumenPorProducto = {};
  let totalDia = 0;

  sesion.ventas.forEach((v) => {
    if (!resumenPorProducto[v.productoId]) {
      resumenPorProducto[v.productoId] = {
        productoId: v.productoId,
        nombre: v.nombre,
        cantidad: 0,
        total: 0,
      };
    }
    resumenPorProducto[v.productoId].cantidad += v.cantidad;
    resumenPorProducto[v.productoId].total += v.total;
    totalDia += v.total;
  });

  const lista = Object.values(resumenPorProducto).sort(
    (a, b) => b.cantidad - a.cantidad
  );

  return {
    fechaISO: sesion.fecha,
    fechaTexto: formatearFechaDDMMYYYY(sesion.fecha),
    productos: lista,
    totalDia,
  };
}

function generarReporteDiario(sesion) {
  const resumen = calcularResumenSesion(sesion);
  const folio = cargarUltimoFolio() + 1;
  guardarUltimoFolio(folio);

  return {
    folio,
    ...resumen,
  };
}

function cerrarSesion(sesion) {
  if (!sesion) return;

  if (!sesion.ventas || sesion.ventas.length === 0) {
    sesion.abierta = false;
    guardarSesionActual(sesion);
    alert(
      `Sesión del día ${formatearFechaDDMMYYYY(
        sesion.fecha
      )} cerrada (sin ventas registradas).`
    );
    return;
  }

  const reporte = generarReporteDiario(sesion);
  agregarReporteAlHistorial(reporte);
  enviarReportePorCorreo(reporte);

  sesion.abierta = false;
  guardarSesionActual(sesion);

  alert(
    `Sesión del día ${reporte.fechaTexto} cerrada.\n` +
      `Folio: ${String(reporte.folio).padStart(3, "0")}\n` +
      `Total del día: ${formatearMoneda(reporte.totalDia)}`
  );

  reporteActualParaImprimir = reporte;
  mostrarReporteEnPantalla(reporte);
}

/* =========================================================
   ENVÍO DE REPORTE POR CORREO (BACKEND)
========================================================= */
function enviarReportePorCorreo(reporte) {
  // ⚠ Si corres el backend en otra máquina/IP, cambia la URL:
  // const apiUrl = "http://192.168.0.10:3000/api/enviar-reporte-diario";
  const apiUrl = "http://localhost:3000/api/enviar-reporte-diario";

  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reporte),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        console.error("Error al enviar correo:", data.error);
      }
    })
    .catch((err) => {
      console.error("Error en la solicitud de correo:", err);
    });
}

/* =========================================================
   REGISTRO DE VENTAS
========================================================= */
function registrarVenta(itemsDeComanda) {
  let sesion = cargarSesionActual();
  if (!sesion || !sesion.abierta) {
    alert("No hay sesión de ventas abierta. Reinicia el sistema o inicia sesión.");
    return;
  }

  const ahora = new Date();
  const hora = ahora.toTimeString().slice(0, 5);

  itemsDeComanda.forEach((item) => {
    sesion.ventas.push({
      hora,
      productoId: item.productoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      total: item.totalFila,
    });
  });

  guardarSesionActual(sesion);
}

/* =========================================================
   MANEJO DE COMANDA
========================================================= */
function agregarAComanda(producto) {
  const existente = comandaItems.find((item) => item.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    comandaItems.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
  }
  renderComanda();
}

function eliminarDeComanda(idProducto) {
  comandaItems = comandaItems.filter((item) => item.id !== idProducto);
  renderComanda();
}

function actualizarCantidadComanda(idProducto, nuevaCantidad) {
  const item = comandaItems.find((i) => i.id === idProducto);
  if (!item) return;

  const cantidad = Number(nuevaCantidad);
  if (isNaN(cantidad) || cantidad <= 0) {
    eliminarDeComanda(idProducto);
  } else {
    item.cantidad = cantidad;
  }
  renderComanda();
}

function limpiarComanda() {
  comandaItems = [];
  renderComanda();
}

function renderComanda() {
  const tbody = document.getElementById("comanda-body");
  const totalSpan = document.getElementById("comanda-total");

  tbody.innerHTML = "";
  let totalComanda = 0;

  comandaItems.forEach((item) => {
    const totalFila = item.precio * item.cantidad;
    totalComanda += totalFila;

    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = item.nombre;
    tr.appendChild(tdNombre);

    const tdCantidad = document.createElement("td");
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "1";
    inputCantidad.value = item.cantidad;
    inputCantidad.style.width = "60px";
    inputCantidad.addEventListener("change", () =>
      actualizarCantidadComanda(item.id, inputCantidad.value)
    );
    tdCantidad.appendChild(inputCantidad);
    tr.appendChild(tdCantidad);

    const tdPrecio = document.createElement("td");
    tdPrecio.classList.add("texto-derecha");
    tdPrecio.textContent = formatearMoneda(item.precio);
    tr.appendChild(tdPrecio);

    const tdTotal = document.createElement("td");
    tdTotal.classList.add("texto-derecha");
    tdTotal.textContent = formatearMoneda(totalFila);
    tr.appendChild(tdTotal);

    const tdAccion = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("btn-eliminar");
    btnEliminar.innerHTML = "✕";
    btnEliminar.title = "Eliminar de la comanda";
    btnEliminar.addEventListener("click", () => eliminarDeComanda(item.id));
    tdAccion.appendChild(btnEliminar);
    tr.appendChild(tdAccion);

    tbody.appendChild(tr);
  });

  totalSpan.textContent = formatearMoneda(totalComanda);
}

/* =========================================================
   RENDER DE PRODUCTOS POR CATEGORÍA
========================================================= */
function renderProductos(categoria) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";

  const filtrados = productos.filter((p) => p.categoria === categoria);

  filtrados.forEach((prod) => {
    const btn = document.createElement("button");
    btn.classList.add("producto-item");
    btn.textContent = `${prod.nombre}\n${formatearMoneda(prod.precio)}`;
    btn.addEventListener("click", () => agregarAComanda(prod));
    contenedor.appendChild(btn);
  });
}

/* =========================================================
   REPORTES DIARIOS
========================================================= */
function mostrarReporteEnPantalla(reporte) {
  const folioSpan = document.getElementById("reporte-folio");
  const fechaSpan = document.getElementById("reporte-fecha-texto");
  const totalSpan = document.getElementById("reporte-total-dia");
  const tbody = document.getElementById("reporte-body");

  tbody.innerHTML = "";

  if (!reporte || !reporte.productos) {
    folioSpan.textContent = "-";
    fechaSpan.textContent = "-";
    totalSpan.textContent = "$0";
    return;
  }

  if (reporte.folio) {
    folioSpan.textContent = String(reporte.folio).padStart(3, "0");
  } else {
    folioSpan.textContent = "Sin folio (día no cerrado)";
  }

  fechaSpan.textContent = reporte.fechaTexto || formatearFechaDDMMYYYY(reporte.fechaISO);
  totalSpan.textContent = formatearMoneda(reporte.totalDia || 0);

  reporte.productos.forEach((p) => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = p.nombre;
    tr.appendChild(tdNombre);

    const tdCant = document.createElement("td");
    tdCant.textContent = p.cantidad;
    tr.appendChild(tdCant);

    const tdTotal = document.createElement("td");
    tdTotal.classList.add("texto-derecha");
    tdTotal.textContent = formatearMoneda(p.total);
    tr.appendChild(tdTotal);

    tbody.appendChild(tr);
  });
}

function generarReportePorFechaDesdeUI() {
  const inputFecha = document.getElementById("reporte-fecha");
  let fechaISO = inputFecha.value;

  if (!fechaISO) {
    fechaISO = hoyISO();
    inputFecha.value = fechaISO;
  }

  let reporte = buscarReportePorFecha(fechaISO);

  if (!reporte) {
    const sesion = cargarSesionActual();
    if (sesion && sesion.fecha === fechaISO && sesion.ventas && sesion.ventas.length > 0) {
      const resumen = calcularResumenSesion(sesion);
      reporte = {
        folio: null,
        ...resumen,
      };
    }
  }

  if (!reporte || !reporte.productos || reporte.productos.length === 0) {
    mostrarReporteEnPantalla(null);
    reporteActualParaImprimir = null;
    alert("No hay ventas registradas para la fecha seleccionada.");
    return;
  }

  reporteActualParaImprimir = reporte;
  mostrarReporteEnPantalla(reporte);
}

/* =========================================================
   IMPRESIÓN (COMANDA / REPORTE)
========================================================= */
function imprimirComanda() {

    const contenido = document.getElementById("print-area").innerHTML;

    const ventana = window.open('', '', 'width=320,height=600');

    ventana.document.write(`
        <html>
        <head>
            <title>Comanda</title>
            <style>
                body {
                    width: 300px;
                    margin: 0;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 14px;
                }

                h2 {
                    text-align: center;
                    font-size: 18px;
                    margin: 5px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                th, td {
                    padding: 4px 0;
                    text-align: left;
                }

                .total {
                    font-size: 16px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                }

                hr {
                    border: none;
                    border-top: 1px dashed black;
                    margin: 8px 0;
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            ${contenido}
        </body>
        </html>
    `);

    ventana.document.close();
}

function imprimirReporteActual() {
  if (!reporteActualParaImprimir) {
    alert("No hay reporte generado para imprimir.");
    return;
  }

  const reporte = reporteActualParaImprimir;
  const printArea = document.getElementById("print-area");
  printArea.innerHTML = "";

  const contenedor = document.createElement("div");

  const titulo = document.createElement("div");
  titulo.classList.add("print-titulo");
  titulo.textContent = "Della Panthera - Reporte diario de ventas";
  contenedor.appendChild(titulo);

  const sub = document.createElement("div");
  sub.classList.add("print-subtitulo");
  const folioTexto = reporte.folio
    ? String(reporte.folio).padStart(3, "0")
    : "Sin folio (día no cerrado)";
  sub.textContent = `Folio: ${folioTexto} - Fecha: ${
    reporte.fechaTexto || formatearFechaDDMMYYYY(reporte.fechaISO)
  }`;
  contenedor.appendChild(sub);

  const detalle = document.createElement("div");
  detalle.classList.add("print-detalle");

  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Producto", "Cantidad total", "Total vendido"].forEach((txt) => {
    const th = document.createElement("th");
    th.textContent = txt;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  reporte.productos.forEach((p) => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = p.nombre;
    tr.appendChild(tdNombre);

    const tdCant = document.createElement("td");
    tdCant.textContent = p.cantidad;
    tr.appendChild(tdCant);

    const tdTotal = document.createElement("td");
    tdTotal.textContent = formatearMoneda(p.total);
    tr.appendChild(tdTotal);

    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
  detalle.appendChild(tabla);

  const totalDiv = document.createElement("div");
  totalDiv.classList.add("print-total");
  totalDiv.textContent = `Total día: ${formatearMoneda(reporte.totalDia)}`;
  detalle.appendChild(totalDiv);

  contenedor.appendChild(detalle);
  printArea.appendChild(contenedor);

  window.print();
}

/* =========================================================
   LOGIN / LOGOUT Y NAVEGACIÓN
========================================================= */
function manejarLogin(event) {
  event.preventDefault();
  const userInput = document.getElementById("username");
  const passInput = document.getElementById("password");
  const errorMsg = document.getElementById("login-error");

  const username = userInput.value.trim();
  const password = passInput.value.trim();

  if (
    username === CREDENCIALES.username &&
    password === CREDENCIALES.password
  ) {
    document.getElementById("login-section").classList.add("oculto");
    document.getElementById("main-section").classList.remove("oculto");
    errorMsg.hidden = true;

    iniciarSesionDeHoy();
    renderProductos("cafe_te");
  } else {
    errorMsg.hidden = false;
  }
}

function manejarLogout() {
  const sesion = cargarSesionActual();
  if (sesion && sesion.abierta && sesion.ventas.length > 0) {
    const cerrar = confirm(
      "Hay una sesión de ventas abierta para hoy.\n" +
        "¿Deseas cerrar el día y generar el reporte antes de cerrar sesión?"
    );
    if (cerrar) {
      cerrarSesion(sesion);
    }
  }

  document.getElementById("main-section").classList.add("oculto");
  document.getElementById("login-section").classList.remove("oculto");
}

function cambiarVista(vista) {
  const btnPos = document.getElementById("nav-pos");
  const btnRep = document.getElementById("nav-reportes");
  const vistaPos = document.getElementById("vista-pos");
  const vistaRep = document.getElementById("vista-reportes");

  if (vista === "pos") {
    btnPos.classList.add("btn-nav-activo");
    btnRep.classList.remove("btn-nav-activo");

    vistaPos.classList.add("vista-interna-activa");
    vistaPos.classList.remove("oculto");
    vistaRep.classList.remove("vista-interna-activa");
    vistaRep.classList.add("oculto");
  } else {
    btnRep.classList.add("btn-nav-activo");
    btnPos.classList.remove("btn-nav-activo");

    vistaRep.classList.add("vista-interna-activa");
    vistaRep.classList.remove("oculto");
    vistaPos.classList.remove("vista-interna-activa");
    vistaPos.classList.add("oculto");
  }
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", manejarLogin);
  }

  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", manejarLogout);
  }

  const navPos = document.getElementById("nav-pos");
  const navReportes = document.getElementById("nav-reportes");

  if (navPos) {
    navPos.addEventListener("click", () => cambiarVista("pos"));
  }
  if (navReportes) {
    navReportes.addEventListener("click", () => cambiarVista("reportes"));
  }

  const botonesCat = document.querySelectorAll(".btn-cat");
  botonesCat.forEach((btn) => {
    btn.addEventListener("click", () => {
      botonesCat.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      const cat = btn.getAttribute("data-cat");
      renderProductos(cat);
    });
  });

  const btnLimpiarComanda = document.getElementById("btn-limpiar-comanda");
  const btnConfirmarVenta = document.getElementById("btn-confirmar-venta");
  const btnImprimirComanda = document.getElementById("btn-imprimir-comanda");

  if (btnLimpiarComanda) {
    btnLimpiarComanda.addEventListener("click", () => {
      const confirmar = confirm("¿Deseas limpiar toda la comanda actual?");
      if (confirmar) limpiarComanda();
    });
  }

  if (btnConfirmarVenta) {
    btnConfirmarVenta.addEventListener("click", () => {
      if (!comandaItems.length) {
        alert("No hay productos en la comanda.");
        return;
      }

      const itemsDeComanda = comandaItems.map((item) => ({
        productoId: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        totalFila: item.precio * item.cantidad,
      }));

      registrarVenta(itemsDeComanda);
      alert(
        "Venta registrada correctamente.\n" +
          "Si necesitas entregar un comprobante, utiliza el botón 'Imprimir comanda'."
      );
    });
  }

  if (btnImprimirComanda) {
    btnImprimirComanda.addEventListener("click", imprimirComandaActual);
  }

  const btnCerrarDia = document.getElementById("btn-cerrar-dia");
  if (btnCerrarDia) {
    btnCerrarDia.addEventListener("click", () => {
      const sesion = cargarSesionActual();
      if (!sesion || !sesion.abierta) {
        alert("No hay sesión de ventas abierta.");
        return;
      }

      const confirmar = confirm(
        "¿Deseas cerrar la sesión del día y generar el reporte (con folio único)?" +
          "\nSe enviará también el reporte por correo."
      );
      if (confirmar) {
        cerrarSesion(sesion);
      }
    });
  }

  const btnGenerarReporte = document.getElementById("btn-generar-reporte");
  const btnImprimirReporte = document.getElementById("btn-imprimir-reporte");

  if (btnGenerarReporte) {
    btnGenerarReporte.addEventListener("click", generarReportePorFechaDesdeUI);
  }

  if (btnImprimirReporte) {
    btnImprimirReporte.addEventListener("click", imprimirReporteActual);
  }

  document.getElementById("main-section").classList.add("oculto");
});
