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
      class="pdf-button no-imprimir"
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

    <!-- Modal de límite alcanzado -->
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
            Para continuar descargando, puedes introducir un código de desbloqueo:
          </p>

          <!-- Input para código de desbloqueo -->
          <div class="codigo-desbloqueo">
            <input
              v-model="codigoDesbloqueo"
              placeholder="Ingrese código aquí"
              type="text"
            />
            <button @click="verificarCodigo" class="btn-primary">
              Verificar código
            </button>
            <p v-if="codigoValido === true" class="success-msg">✅ Código válido, descargas desbloqueadas</p>
            <p v-else-if="codigoValido === false" class="error-msg">❌ Código incorrecto</p>
          </div>

          <p>
            O contacta al administrador del sistema:
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
            El administrador podrá restablecer tu contador de descargas.
          </p>

          <!-- Información de depuración (solo en desarrollo) -->
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
          <button @click="copiarContacto" class="btn-primary">
            {{ textoCopiado ? "✓ Copiado" : "Copiar numero de contacto" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Contador flotante -->
    <div class="contador-info no-imprimir" v-if="!limiteAlcanzado">
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
import { ref, computed, nextTick, onMounted } from "vue";
import html2pdf from "html2pdf.js";
import Hoja1 from "./Hoja1.vue";
import Hoja2 from "./Hoja2.vue";
import Hoja3 from "./Hoja3.vue";
import { useRoute } from "vue-router";

const documento = ref(null);
const generando = ref(false);
const nombre = ref("Invitado");
const route = useRoute();

// Descargas
const limiteDescargas = ref(6);
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);

// Desbloqueo por código
const codigoDesbloqueo = ref("");
const codigoValido = ref(null);
const codigosPermitidos = ["ABC123", "XYZ789"]; // Ejemplo de códigos válidos

const deviceId = ref("");
const browserFingerprint = ref("");

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

function generarIdentificadorDispositivo() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
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

  deviceKeys.forEach((key) => localStorage.setItem(key, storedDeviceId));

  deviceId.value = storedDeviceId;
}

function getUniqueIdentifier() {
  return {
    fingerprint: `cv_pdf_${browserFingerprint.value}`,
    device: `cv_pdf_device_${deviceId.value}`,
    hybrid: `cv_pdf_${deviceId.value}_${browserFingerprint.value}`,
    global: `cv_pdf_global_${browserFingerprint.value}`,
    domain: "cv_app_pdf_downloads",
  };
}

function cargarContadorDescargas() {
  const keys = getUniqueIdentifier();
  let maxUsadas = 0;
  for (const key of Object.values(keys)) {
    const datos = localStorage.getItem(key);
    if (datos) {
      try {
        const parsed = JSON.parse(datos);
        if (parsed.usadas > maxUsadas) maxUsadas = parsed.usadas;
      } catch {}
    }
  }
  descargasUsadas.value = maxUsadas;
}

function guardarContadorDescargas() {
  const keys = getUniqueIdentifier();
  const info = { usadas: descargasUsadas.value, limite: limiteDescargas.value };
  Object.values(keys).forEach((key) => localStorage.setItem(key, JSON.stringify(info)));
}

async function generarPDF() {
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

  await nextTick();
  generando.value = true;

  const opciones = {
    margin: 0,
    filename: `hoja-de-vida-${nombre.value}.pdf`,
    image: { type: "pdf", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opciones).from(documento.value).save();
    descargasUsadas.value++;
    guardarContadorDescargas();
    if (limiteAlcanzado.value) setTimeout(() => mostrarModalLimite.value = true, 1000);
  } catch (e) {
    console.error(e);
  } finally {
    generando.value = false;
  }
}

function cerrarModal() {
  mostrarModalLimite.value = false;
  textoCopiado.value = false;
  codigoDesbloqueo.value = "";
  codigoValido.value = null;
}

async function copiarContacto() {
  try {
    await navigator.clipboard.writeText("3145193285");
    textoCopiado.value = true;
    setTimeout(() => textoCopiado.value = false, 2000);
  } catch (e) {
    console.error(e);
  }
}

// Verificar código de desbloqueo
function verificarCodigo() {
  if (codigosPermitidos.includes(codigoDesbloqueo.value.trim())) {
    codigoValido.value = true;
    descargasUsadas.value = 0; // Reinicia contador
    guardarContadorDescargas();
  } else {
    codigoValido.value = false;
  }
}
</script>

<style>
.pdf-root { background: #fff; padding: 0.3in; }
.carta { page-break-after: always; }
.carta:last-child { page-break-after: auto; }

/* Botón flotante */
.pdf-button { position: fixed; right: 24px; bottom: 24px; padding: 12px 18px; min-width: 180px; border-radius: 12px; border: none; outline: none; cursor: pointer; color: #fff; background: linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%); box-shadow: 0 8px 20px rgba(0,0,0,0.2); display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; letter-spacing: 0.2px; transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease; z-index: 1000; }
.pdf-button:hover:not(:disabled){ transform: translateY(-2px); box-shadow:0 12px 24px rgba(0,0,0,0.25); }
.pdf-button:disabled{ opacity:0.75; cursor:not-allowed; transform:none; box-shadow:0 8px 20px rgba(0,0,0,0.15);}
.pdf-button.limite-alcanzado{ background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%); cursor:pointer; opacity:1; }

/* Contador flotante */
.contador-info{ position: fixed; right: 24px; bottom: 90px; background: rgba(255,255,255,0.95); padding:8px 12px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); font-size:12px; color:#666; z-index:999; }
.contador-text{ display:block; margin-bottom:4px; font-weight:500; }
.contador-barra{ width:120px; height:4px; background:#e5e7eb; border-radius:2px; overflow:hidden; }
.contador-progreso{ height:100%; background: linear-gradient(90deg,#10b981 0%,#059669 100%); transition: width 0.3s ease; }

/* Ocultar durante generación PDF */
.generando-pdf .no-imprimir { display:none !important; }

/* Modal y botones omitido por brevedad (usa tu CSS original) */

.codigo-desbloqueo{ display:flex; flex-direction:column; gap:0.5rem; margin:0.5rem 0; }
.codigo-desbloqueo input{ padding:0.5rem; border-radius:6px; border:1px solid #ccc; }
.codigo-desbloqueo .btn-primary{ width:max-content; }
.success-msg{ color:green; font-weight:500; }
.error-msg{ color:red; font-weight:500; }
</style>
