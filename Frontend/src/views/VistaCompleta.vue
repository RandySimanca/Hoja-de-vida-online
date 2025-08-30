<template>
  <div>
    <div
      id="documento-pdf"
      ref="documento"
      class="pdf-root"
      :class="{ 'generando-pdf': generando }"
    >
      <Hoja1 />
      <Hoja2 />
      <Hoja3 />
    </div>

    <!-- Botón flotante para generar PDF -->
    <button
      class="pdf-button"
      :disabled="generando"
      :class="{ 'limite-alcanzado': limiteAlcanzado }"
      :aria-busy="generando ? 'true' : 'false'"
      @click="generarPDF"
      :title="limiteAlcanzado ? 'Click para ver opciones de contacto' : 'Generar PDF'"
    >
      <span
        v-if="!generando && !limiteAlcanzado"
        class="btn-icon"
        aria-hidden="true"
        >📄</span
      >
      <span v-else-if="limiteAlcanzado" class="btn-icon" aria-hidden="true"
        >🔒</span
      >
      <span v-else class="spinner" aria-hidden="true"></span>
      <span class="btn-text">
        {{
          limiteAlcanzado
            ? "Generar PDF (Límite alcanzado)"
            : generando
            ? "Generando..."
            : `Generar PDF (${descargasRestantes}/${limiteDescargas})`
        }}
      </span>
    </button>

    <!-- Modal de límite alcanzado y desbloqueo -->
    <div v-if="mostrarModalLimite" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🔒 Descargas en modo gratis alcanzado</h3>
          <button @click="cerrarModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Has alcanzado el límite máximo de
            <strong>{{ limiteDescargas }} descargas</strong> de tu hoja de vida
            en PDF en el modo gratuito.
          </p>
          <p>
            Para continuar descargando, contacta al administrador del sistema:
          </p>

          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">🙋</span>
              <span>Randy Simanca</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>+57 314 519 3285</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span>randysimancamercado@gmail.com</span>
            </div>
          </div>

          <p class="note">
            El administrador podrá restablecer tu contador de descargas o ingresa un código de desbloqueo.
          </p>

          <!-- Input de códigos de desbloqueo -->
          <div class="codigo-desbloqueo">
            <label for="codigo" class="block font-medium mb-1">
              Ingresa código de desbloqueo:
            </label>
            <input
              type="text"
              id="codigo"
              v-model="codigoIngresado"
              placeholder="Ej: ABC123"
              class="input-codigo"
            />
            <button @click="validarCodigo" class="btn-primary mt-2">
              Validar Código
            </button>
            <p v-if="mensajeCodigo" class="mensaje-codigo">{{ mensajeCodigo }}</p>
          </div>

          <!-- Debug info (solo desarrollo) -->
          <div v-if="$route.query.debug === 'true'" class="debug-info">
            <hr style="margin: 1rem 0" />
            <p><strong>Debug Info:</strong></p>
            <p>Device ID: {{ deviceId }}</p>
            <p>Browser Fingerprint: {{ browserFingerprint }}</p>
            <p>Descargas usadas: {{ descargasUsadas }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Contador visual (opcional) -->
    <div class="contador-info" v-if="!limiteAlcanzado">
      <span class="contador-text"
        >Descargas disponibles: {{ descargasRestantes }}</span
      >
      <div class="contador-barra">
        <div
          class="contador-progreso"
          :style="{ width: `${(descargasUsadas / limiteDescargas) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import html2pdf from "html2pdf.js";
import Hoja1 from "./Hoja1.vue";
import Hoja2 from "./Hoja2.vue";
import Hoja3 from "./Hoja3.vue";
import { useRoute } from "vue-router";

const documento = ref(null);
const generando = ref(false);
const nombre = ref("Invitado");
const route = useRoute();

// Contadores
const limiteDescargas = ref(6);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);

// Desbloqueo
const codigoIngresado = ref("");
const mensajeCodigo = ref("");

// Identificadores
const deviceId = ref("");
const browserFingerprint = ref("");

// Computed
const descargasRestantes = computed(
  () => limiteDescargas.value - descargasUsadas.value
);
const limiteAlcanzado = computed(
  () => descargasUsadas.value >= limiteDescargas.value
);

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem("usuario"));
  if (datos?.nombre) nombre.value = datos.nombre;

  generarIdentificadorDispositivo();
  cargarContadorDescargas();
});

// Funciones de identificador de dispositivo
function generarIdentificadorDispositivo() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("Device fingerprint", 2, 2);

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || "unknown",
    navigator.deviceMemory || "unknown",
  ].join("|");

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  browserFingerprint.value = Math.abs(hash).toString(36);

  const deviceKeys = [
    "app_device_id",
    "pdf_device_tracker",
    `device_${browserFingerprint.value}`,
    "cv_app_device",
  ];

  let storedDeviceId = null;
  for (const key of deviceKeys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      storedDeviceId = stored;
      break;
    }
  }

  if (!storedDeviceId) {
    storedDeviceId =
      "dev_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substr(2, 9);
  }

  deviceKeys.forEach((key) => {
    try {
      localStorage.setItem(key, storedDeviceId);
    } catch (e) {
      console.warn(`No se pudo guardar en ${key}:`, e);
    }
  });

  deviceId.value = storedDeviceId;
}

function getUniqueIdentifier() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  return {
    fingerprint: `cv_pdf_${browserFingerprint.value}`,
    device: `cv_pdf_device_${deviceId.value}`,
    hybrid: `cv_pdf_${deviceId.value}_${browserFingerprint.value}`,
    global: `cv_pdf_global_${browserFingerprint.value}`,
    domain: "cv_app_pdf_downloads",
    backup1: `pdf_backup_${btoa(navigator.userAgent).slice(0, 10)}`,
    backup2: `pdf_limit_${screen.width}x${screen.height}_${navigator.language}`,
  };
}

// Contador
function cargarContadorDescargas() {
  const keys = getUniqueIdentifier();
  let datosContador = null;
  let maxUsadas = 0;
  for (const key of Object.values(keys)) {
    const datos = localStorage.getItem(key);
    if (datos) {
      try {
        const parsed = JSON.parse(datos);
        if (parsed.usadas > maxUsadas) {
          maxUsadas = parsed.usadas;
          datosContador = parsed;
        }
      } catch (e) {}
    }
  }

  if (datosContador) {
    descargasUsadas.value = maxUsadas;
    limiteDescargas.value = datosContador.limite || 6;
    guardarContadorDescargas();
  } else {
    descargasUsadas.value = 0;
  }
}

function guardarContadorDescargas() {
  const keys = getUniqueIdentifier();
  const info = {
    usadas: descargasUsadas.value,
    limite: limiteDescargas.value,
    ultimaDescarga: new Date().toISOString(),
    dispositivo: deviceId.value,
    fingerprint: browserFingerprint.value,
    timestamp: Date.now(),
  };

  Object.values(keys).forEach((key) => {
    try {
      localStorage.setItem(key, JSON.stringify(info));
    } catch (e) {}
  });

  try {
    sessionStorage.setItem("cv_pdf_backup", JSON.stringify(info));
  } catch (e) {}
}

// Generar PDF
async function generarPDF() {
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

  await nextTick();
  generando.value = true;

  const opciones = {
    margin: 0,
    filename: `hoja-de-vida.pdf`,
    image: { type: "pdf", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opciones).from(documento.value).save();
    descargasUsadas.value++;
    guardarContadorDescargas();

    if (limiteAlcanzado.value) {
      setTimeout(() => {
        mostrarModalLimite.value = true;
      }, 1000);
    }
  } catch (error) {
    console.error("Error al generar PDF:", error);
  } finally {
    generando.value = false;
  }
}

// Modal
function cerrarModal() {
  mostrarModalLimite.value = false;
  codigoIngresado.value = "";
  mensajeCodigo.value = "";
}

// Validar códigos de desbloqueo
function validarCodigo() {
  const codigosValidos = ["DESBLOQUEO1", "LIBERARPDF", "ADMIN123"];
  if (codigosValidos.includes(codigoIngresado.value.trim().toUpperCase())) {
    descargasUsadas.value = 0;
    guardarContadorDescargas();
    mostrarModalLimite.value = false;
    mensajeCodigo.value = "";
    codigoIngresado.value = "";
    alert("✅ Código válido. Contador desbloqueado.");
  } else {
    mensajeCodigo.value = "❌ Código inválido. Intenta de nuevo.";
  }
}
</script>

<style>
/* Mantengo todos los estilos originales del botón flotante, modal y contador */
/* ... aquí puedes copiar exactamente los estilos de tu componente anterior ... */

.input-codigo {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
}

.mensaje-codigo {
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 4px;
}
</style>
