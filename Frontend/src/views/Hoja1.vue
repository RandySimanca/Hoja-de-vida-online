<!-- src/views/Hoja1.vue -->
<template>
  <!-- Sección del encabezado -->
  <div class="section-general contenido-pagina carta">
    <div>
      <HeaderComponent />
    </div>
    <form @submit.prevent="enviarFormulario">
      <!-- Sección de datos cargados -->
      <div
        v-if="hojaStore.cargado"
        class="datos-formacion-wrap compact contenido-pagina"
      >
        <DatosPerComponent :datos="hojaStore.datosPersonales || {}" />
        <FormacionAcadComponent
          :formacion="hojaStore.formacionAcademica || {}"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
/** ─────── 🔧 Imports ─────── **/
import { onMounted, ref } from "vue";
import { useHojaVidaStore } from "../stores/hojaVida";
import { useDatosStore } from "../stores/datos";
import { useUsuarioStore } from "../stores/usuarios";
import api from "../api/axios.js";
import html2pdf from "html2pdf.js";

/** ─────── 🧠 Componentes ─────── **/
import HeaderComponent from "../components/HeaderComponent.vue";
import DatosPerComponent from "../components/DatosPerComponent.vue";
import FormacionAcadComponent from "../components/FormacionAcadComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";

/** ─────── 🗂️ Instancias de stores ─────── **/
const hojaStore = useHojaVidaStore();
const datosStore = useDatosStore();
const usuarioStore = useUsuarioStore();

/** ─────── 🔐 Cargar datos si hay token ─────── **/
const token = localStorage.getItem("token");

onMounted(() => {
  if (!token) {
    console.error(
      "❌ Token no encontrado. Redirigiendo o mostrando fallback..."
    );
 
  } else {
    hojaStore.cargarHojaDeVida(); 
    console.log("✅ Token válido:", token);
  }
});

/** ─────── 📤 Envío de formulario (solo si deseas guardar) ─────── **/
const safeValue = (val) => (val !== undefined ? val : ""); // Protección básica

const enviarFormulario = async () => {
  const datosPersonales = {
    apellido1: safeValue(apellido1?.value),
    apellido2: safeValue(apellido2?.value),
    nombres: safeValue(nombres?.value),
    tipoDocumento: cedula?.value
      ? "C.C."
      : cedulExt?.value
      ? "C.E."
      : pasaporte?.value
      ? "PAS."
      : "",
    sexo: sexoF?.value ? "F" : sexoM?.value ? "M" : "",
    nacionalidad: nacionalidad?.value
      ? "Colombiana"
      : nacExt?.value
      ? "Extranjera"
      : "",
    pais: safeValue(pais?.value),
    libretaMilitar: safeValue(libretaMilitar?.value),
    numeroLibreta: safeValue(numeroLibreta?.value),
    dm: safeValue(dm?.value),
    fechaNacimiento: {
      dia: safeValue(diaNac?.value),
      mes: safeValue(mesNac?.value),
      ano: safeValue(anoNac?.value),
    },
    lugarNacimiento: {
      pais: safeValue(paisNac?.value),
      depto: safeValue(deptoNac?.value),
      municipio: safeValue(municipioNac?.value),
    },
    direccion: {
      pais: safeValue(paisCorr?.value),
      depto: safeValue(deptoCorr?.value),
      municipio: safeValue(municipioCorr?.value),
      direccion: safeValue(direccionCorr?.value),
      telefono: safeValue(telefono?.value),
      email: safeValue(email?.value),
    },
    idiomas: [
      {
        idioma: safeValue(idioma1?.value),
        habla: safeValue(habla1?.value),
        lee: safeValue(lee1?.value),
        escribe: safeValue(escribe1?.value),
      },
      {
        idioma: safeValue(idioma2?.value),
        habla: safeValue(habla2?.value),
        lee: safeValue(lee2?.value),
        escribe: safeValue(escribe2?.value),
      },
    ],
    formacionAcademica: [
      {
        modalidad: safeValue(modalidad1?.value),
        semestres: safeValue(semestres1?.value),
        graduado: safeValue(graduado1?.value),
        titulo: safeValue(titulo1?.value),
        mes: safeValue(mes1?.value),
        ano: safeValue(ano1?.value),
        tarjeta: safeValue(tarjeta1?.value),
      },
      {
        modalidad: safeValue(modalidad2?.value),
        semestres: safeValue(semestres2?.value),
        graduado: safeValue(graduado2?.value),
        titulo: safeValue(titulo2?.value),
        mes: safeValue(mes2?.value),
        ano: safeValue(ano2?.value),
        tarjeta: safeValue(tarjeta2?.value),
      },
      {
        modalidad: safeValue(modalidad3?.value),
        semestres: safeValue(semestres3?.value),
        graduado: safeValue(graduado3?.value),
        titulo: safeValue(titulo3?.value),
        mes: safeValue(mes3?.value),
        ano: safeValue(ano3?.value),
        tarjeta: safeValue(tarjeta3?.value),
      },
    ],
  };

  try {
    const respuesta = await api.post("/datos-personales", datosPersonales, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Datos enviados con éxito:", respuesta.data);
  } catch (error) {
    console.error(
      "❌ Error al enviar datos:",
      error.response?.data || error.message
    );
  }
};

const hojaRef = ref(null);

function generarPDF() {
  if (!hojaRef.value) {
    console.error("❌ No se encontró el elemento hojaDeVidaPDF");
    return;
  }

  const opciones = {
    margin: 0.2,
    filename: "hoja-de-vida.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf().set(opciones).from(elemento).save();
}
</script>

<style scoped>
.section {
  padding: 2rem;
}
</style>

<style>
/* ===== TUS ESTILOS ORIGINALES (SIN MODIFICAR) ===== */
button {
  padding: 10px 20px;
  background-color: #4caf50;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.boton-guardar {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.boton-actualizar {
  background-color: #1e90ff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 30px;
}

.boton-guardar:hover {
  background-color: #2980b9;
}

.h1 {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
  color: #ffffff;
  letter-spacing: 1px;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
}

.main-content {
  flex-grow: 1;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.header {
  background-color: #24292e;
  color: #fff;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
  text-align: center;
}

.h1 {
  color: #f10c0c;
  text-align: center;
  margin-bottom: 24px;
}

.boton-cerrar {
  background-color: #ef4444;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.boton-cerrar:hover {
  background-color: #dc2626;
}

.saludo {
  font-family: "Poppins", sans-serif;
  font-size: 1.1rem;
  color: #2c3e50;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid #34495e;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
}

.saludo strong {
  color: #1a1a1a;
  font-weight: 600;
}

.saludo {
  text-align: center;
  margin-bottom: 24px;
}

.saludo {
  display: block;
  margin-bottom: 24px;
}

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #1d1f27, #2c2f36);
  color: #f1f1f1;
  padding: 20px;
  height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", sans-serif;
}

.sidebar-menu li {
  margin-bottom: 16px;
}

.sidebar-menu a {
  display: block;
  padding: 12px 16px;
  color: #e0e0e0;
  background-color: transparent;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-exact-active {
  background-color: #00d8ff22;
  color: #00d8ff;
  font-weight: 600;
  border-left: 4px solid #00d8ff;
}

.sidebar {
  width: 220px;
  background-color: #1d2024;
  color: white;
  padding: 20px;
  height: 100%;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 16px;
}

.sidebar-menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.sidebar-menu a:hover {
  color: #00d8ff;
}

.section-scrol {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.section {
  border: 2px solid rgb(0, 204, 255);
  padding: 10px;
  gap: 10px;
  display: block;
  border-radius: 18px;
  flex-direction: row;
  gap: 1px;
  align-items: flex-start;
  margin-top: 0;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 1);
  box-sizing: border-box;
}

.section-general {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  margin-bottom: 40px;
  margin-top: 10px;
}

.contenido-pagina {
  flex: 1;
  overflow: hidden;
}

.section-title {
  background-color: rgb(10, 10, 10);
  padding: 2px;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
  max-width: fit-content;
  border-radius: 5px;
}

.section-number {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #b4b4b4;
  color: rgb(255, 255, 255);
  text-align: center;
  border-radius: 50%;
  margin-right: 10px;
}

.container1 {
  border: 5px solid rgb(0, 204, 255);
  border-radius: 18px;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1px;
  border: 2px solid rgb(0, 204, 255);
  border-radius: 18px;
  flex-direction: row;
  gap: 100px;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 1);
}

.image-column,
.form-group {
  flex: 1;
}

.declaration p {
  font-size: 12px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.declaration td {
  font-size: 12px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

header {
  text-align: center;
}

.main-section {
  display: flex;
}

.header h2,
.header h3,
.header p {
  margin: 5px 0;
  color: #f8f6f6;
}

.header {
  margin-top: 0;
  align-items: center;
  background-color: #117de9;
  color: rgb(253, 252, 252);
  padding: 16px 32px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-family: "Segoe UI", sans-serif;
  padding-top: 0;
  display: flex;
  justify-content: center;
  text-align: center;
}

form {
  margin-bottom: 5px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 2px;
  font-size: 11px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin: 5px;
  outline: 2px solid #808080;
}

.form-group {
  margin-right: 5px;
  margin-bottom: 2px;
  flex: 1;
}

.form-control {
  width: 70%;
  padding: 0px;
  box-sizing: border-box;
  height: 24px;
}

.form-control1 {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.form-control2 {
  width: 50%;
  padding: 5px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.form-control3 {
  width: 30%;
  padding: 4px;
  box-sizing: border-box;
  height: 28px;
}

.checkbox-group {
  display: flex;
  align-items: left;
  margin-right: 5px;
}

.checkbox-group input {
  margin-left: 0px;
}

.imagen {
  width: 100px;
  height: 120px;
  border: 1px solid #ccc;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.table th,
.table td {
  border: 1px solid #ccc;
  padding: 1px;
  text-align: center;
  font-size: 12px;
}

.table th {
  background-color: #f0f0f0;
}

.btn btn-danger {
  line-height: 1;
  padding: 0.5rem 1rem;
}

.compacto h3,
.compacto h2,
.compacto p {
  margin-top: 0;
  margin-bottom: 4px;
  text-align: center;
}

.col-2 {
  flex: 10 0 10%;
}

.col-3 {
  flex: 0 0 31%;
}

.col-4 {
  flex: 0 0 23%;
}

.p {
  font-size: 11px;
}

.datos-formacion-wrap.compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0;
}

.datos-formacion-wrap.compact > * {
  margin-top: 0;
  margin-bottom: 0;
}

.no-experiencias-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.no-experiencias-message {
  background: #fff;
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.no-experiencias-message:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.icon-large {
  font-size: 3rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.no-experiencias-message h3 {
  color: #111827;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.no-experiencias-message p {
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.btn-recordatorio {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn-recordatorio:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transform: translateY(-2px);
}

.compoFirma {
  height: 350px; 
}

/* ===== SOLO RESPONSIVIDAD AGREGADA - NO MODIFICA DISEÑO ORIGINAL ===== */

/* Tablet - 768px y menor */
@media screen and (max-width: 768px) {
  .layout {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-menu {
    display: flex;
    flex-wrap: wrap;
  }
  
  .container {
    gap: 20px;
    padding: 15px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-group {
    margin-right: 0;
    min-width: 100%;
  }
  
  .form-control {
    width: 100%;
  }
  
  .form-control2 {
    width: 100%;
  }
  
  .form-control3 {
    width: 100%;
  }
  
  .boton-actualizar {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .main-content {
    padding: 15px;
  }
  
  .section-scrol {
    padding: 15px;
  }
}

/* Mobile - 480px y menor */
@media screen and (max-width: 480px) {
  .sidebar {
    padding: 15px;
  }
  
  .sidebar-menu {
    flex-direction: column;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .header {
    padding: 10px 15px;
    flex-direction: column;
  }
  
  .container {
    flex-direction: column;
    gap: 15px;
    padding: 10px;
  }
  
  .section {
    padding: 15px;
  }
  
  .section-scrol {
    padding: 10px;
  }
  
  .form-group {
    margin-bottom: 10px;
  }
  
  button,
  .boton-guardar,
  .boton-actualizar {
    width: 100%;
    margin: 5px 0;
  }
  
  .table {
    font-size: 10px;
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }
  
  .no-experiencias-message {
    margin: 10px;
    padding: 1.5rem;
  }
  
  .compoFirma {
    height: 250px;
  }
}

/* Mobile muy pequeño - 320px y menor */
@media screen and (max-width: 320px) {
  .main-content {
    padding: 5px;
  }
  
  .section {
    padding: 8px;
  }
  
  .section-scrol {
    padding: 8px;
  }
  
  .container {
    padding: 8px;
  }
  
  .header {
    padding: 8px 10px;
  }
  
  .table th,
  .table td {
    padding: 2px;
    font-size: 9px;
  }
  
  .compoFirma {
    height: 200px;
  }
}

/* Tamaño carta en impresión - MANTENIDO ORIGINAL */
@media print {
  .carta {
    width: 8.5in !important;
    height: 11in !important;
    padding: 0.4in !important;
    page-break-after: always !important;
    box-sizing: border-box;
  }
  
  .carta:last-child {
    page-break-after: auto;
  }
}
</style>
  
  .carta:last-child {
    page-break-after: auto;
  }
}
</style>
