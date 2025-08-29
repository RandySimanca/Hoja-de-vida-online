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

    <!-- Botón de generar PDF -->
    <button
      class="pdf-button"
      :disabled="generando"
      :class="{ 'limite-alcanzado': limiteAlcanzado }"
      :aria-busy="generando ? 'true' : 'false'"
      @click="generarPDF"
      :title="
        limiteAlcanzado ? 'Click para ver opciones de contacto' : 'Generar PDF'
      "
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

    <!-- Contador visual (opcional - para mostrar al usuario) -->
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
import { ref, nextTick, computed, onMounted } from "vue";
import html2pdf from "html2pdf.js";
import Hoja1 from "./Hoja1.vue";
import Hoja2 from "./Hoja2.vue";
import Hoja3 from "./Hoja3.vue";
import { useRoute } from "vue-router";
import { useUsuarioStore } from "../stores/usuarios";

const documento = ref(null);
const generando = ref(false);
const nombre = ref("Invitado");
const route = useRoute();
const usuarioStore = useUsuarioStore();

// Sistema de contador de descargas
const limiteDescargas = ref(2); // Límite configurable
const descargasUsadas = ref(0);
const mostrarModalLimite = ref(false);
const textoCopiado = ref(false);
const deviceId = ref("");
const browserFingerprint = ref("");

// Computed properties
const descargasRestantes = computed(
  () => limiteDescargas.value - descargasUsadas.value
);
const limiteAlcanzado = computed(
  () => descargasUsadas.value >= limiteDescargas.value
);

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem("usuario"));
  if (datos?.nombre) nombre.value = datos.nombre;

  // Generar identificador único del dispositivo/navegador
  generarIdentificadorDispositivo();

  // Cargar contador de descargas del localStorage
  cargarContadorDescargas();
});

function generarIdentificadorDispositivo() {
  // Crear un fingerprint más robusto del navegador/dispositivo
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

  // Generar hash simple del fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  browserFingerprint.value = Math.abs(hash).toString(36);

  // Estrategia múltiple para ID del dispositivo
  const deviceKeys = [
    "app_device_id",
    "pdf_device_tracker",
    `device_${browserFingerprint.value}`,
    "cv_app_device",
  ];

  let storedDeviceId = null;

  // Buscar en cualquiera de las claves
  for (const key of deviceKeys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      storedDeviceId = stored;
      break;
    }
  }

  // Si no existe, generar nuevo ID
  if (!storedDeviceId) {
    storedDeviceId =
      "dev_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substr(2, 9);
  }

  // Guardar en todas las claves para redundancia
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
  // Generar múltiples identificadores para máxima persistencia
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const userId = usuario?.id || usuario?.email || usuario?.nombre || "anonimo";

  // Usar múltiples estrategias de identificación
  return {
    // Estrategia 1: Basada en fingerprint del navegador (más persistente)
    fingerprint: `cv_pdf_${browserFingerprint.value}`,

    // Estrategia 2: Basada en device ID
    device: `cv_pdf_device_${deviceId.value}`,

    // Estrategia 3: Combinación device + fingerprint
    hybrid: `cv_pdf_${deviceId.value}_${browserFingerprint.value}`,

    // Estrategia 4: Global con hash del navegador
    global: `cv_pdf_global_${browserFingerprint.value}`,

    // Estrategia 5: Clave fija para el dominio/aplicación
    domain: "cv_app_pdf_downloads",

    // Estrategias adicionales en caso de que las otras fallen
    backup1: `pdf_backup_${btoa(navigator.userAgent).slice(0, 10)}`,
    backup2: `pdf_limit_${screen.width}x${screen.height}_${navigator.language}`,
  };
}

function cargarContadorDescargas() {
  const keys = getUniqueIdentifier();

  // Intentar cargar de cualquiera de las claves disponibles
  let datosContador = null;
  let keyUsada = null;
  let maxUsadas = 0;

  // Buscar el valor más alto en todas las claves
  for (const [keyName, key] of Object.entries(keys)) {
    const datos = localStorage.getItem(key);
    if (datos) {
      try {
        const parsedData = JSON.parse(datos);
        if (parsedData.usadas > maxUsadas) {
          maxUsadas = parsedData.usadas;
          datosContador = parsedData;
          keyUsada = key;
        }
        console.log(
          `Encontrado contador en ${keyName}: ${parsedData.usadas} descargas`
        );
      } catch (e) {
        console.warn(`Error al parsear datos de ${keyName}:`, e);
      }
    }
  }

  if (datosContador && maxUsadas > 0) {
    descargasUsadas.value = maxUsadas;
    limiteDescargas.value = datosContador.limite || 1;
    console.log(
      `Contador restaurado: ${maxUsadas}/${datosContador.limite} desde ${keyUsada}`
    );

    // Propagar a todas las claves para futuras consultas
    guardarContadorDescargas();
  } else {
    // Valores por defecto solo si NO se encuentra ningún contador
    descargasUsadas.value = 0;
    limiteDescargas.value = 1;
    console.log("Contador inicializado en 0 - primera vez");
  }

  // Crear un backup adicional en sessionStorage como respaldo temporal
  try {
    const sessionData = sessionStorage.getItem("cv_pdf_backup");
    if (sessionData) {
      const sessionInfo = JSON.parse(sessionData);
      if (sessionInfo.usadas > descargasUsadas.value) {
        descargasUsadas.value = sessionInfo.usadas;
        guardarContadorDescargas();
        console.log("Contador restaurado desde sessionStorage");
      }
    }
  } catch (e) {
    console.warn("Error con sessionStorage backup:", e);
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
    version: "2.0", // Para identificar esta versión mejorada
  };

  let guardadoExitoso = false;

  // Guardar en todas las claves para máxima persistencia
  Object.entries(keys).forEach(([keyName, key]) => {
    try {
      localStorage.setItem(key, JSON.stringify(info));
      guardadoExitoso = true;
      console.log(`✓ Contador guardado en: ${keyName}`);
    } catch (e) {
      console.warn(`✗ Error al guardar en ${keyName}:`, e);
    }
  });

  // Backup adicional en sessionStorage
  try {
    sessionStorage.setItem("cv_pdf_backup", JSON.stringify(info));
    console.log("✓ Backup guardado en sessionStorage");
  } catch (e) {
    console.warn("✗ Error con sessionStorage backup:", e);
  }

  // Crear múltiples registros de auditoría con diferentes nombres
  const auditKeys = [
    `cv_audit_${Date.now()}`,
    `pdf_log_${descargasUsadas.value}_${Date.now()}`,
    `download_track_${browserFingerprint.value}_${Date.now()}`,
  ];

  auditKeys.forEach((auditKey) => {
    try {
      localStorage.setItem(
        auditKey,
        JSON.stringify({
          accion: "descarga",
          dispositivo: deviceId.value,
          fingerprint: browserFingerprint.value,
          timestamp: Date.now(),
          totalUsadas: descargasUsadas.value,
          fecha: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Error al guardar auditoria:", e);
    }
  });

  if (!guardadoExitoso) {
    console.error(
      "🚨 ADVERTENCIA: No se pudo guardar el contador en ninguna clave"
    );
    alert("Error: No se pudo guardar el progreso. Contacte al administrador.");
  }
}

async function generarPDF() {
  // Verificar límite antes de proceder - siempre mostrar modal si está bloqueado
  if (limiteAlcanzado.value) {
    mostrarModalLimite.value = true;
    return;
  }

  // Asegurar que el DOM y recursos estén listos
  await nextTick();
  await new Promise((r) => setTimeout(r, 150));
  generando.value = true;

  const opciones = {
    margin: 0,
    filename: "hoja-de-vida.pdf",
    image: { type: "pdf", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    const nombreUsuario = nombre.value?.trim() || "usuario";
    const nombreArchivo = `hoja de vida ${nombreUsuario}.pdf`;

    await html2pdf().set(opciones).from(documento.value).save(nombreArchivo);

    // Incrementar contador y guardar
    descargasUsadas.value++;
    guardarContadorDescargas();

    // Mostrar modal si se alcanzó el límite
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

function cerrarModal() {
  mostrarModalLimite.value = false;
  textoCopiado.value = false;
}

async function copiarContacto() {
  try {
    await navigator.clipboard.writeText("3145193285");
    textoCopiado.value = true;
    setTimeout(() => {
      textoCopiado.value = false;
    }, 2000);
  } catch (error) {
    console.error("Error al copiar:", error);
  }
}

// Función para que el admin pueda resetear el contador (solo para desarrollo/testing)
function resetearContador() {
  const keys = getUniqueIdentifier();

  console.log("🔄 Iniciando reseteo completo del contador...");

  // Resetear todos los contadores principales
  Object.entries(keys).forEach(([keyName, key]) => {
    localStorage.removeItem(key);
    console.log(`✓ Contador reseteado: ${keyName}`);
  });

  // Limpiar device IDs
  const deviceKeys = [
    "app_device_id",
    "pdf_device_tracker",
    `device_${browserFingerprint.value}`,
    "cv_app_device",
  ];
  deviceKeys.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`✓ Device ID removido: ${key}`);
  });

  // Limpiar registros de auditoría
  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("pdf_audit_") ||
      key.startsWith("cv_audit_") ||
      key.startsWith("pdf_log_") ||
      key.startsWith("download_track_")
    ) {
      localStorage.removeItem(key);
    }
  });

  // Limpiar sessionStorage
  try {
    sessionStorage.removeItem("cv_pdf_backup");
    console.log("✓ SessionStorage backup limpiado");
  } catch (e) {
    console.warn("Error limpiando sessionStorage:", e);
  }

  descargasUsadas.value = 0;
  console.log("✅ Contador completamente reseteado");

  // Regenerar identificadores
  generarIdentificadorDispositivo();
  guardarContadorDescargas();
}

// Función para verificar y diagnosticar el problema
function diagnosticarPersistencia() {
  console.log("🔍 === DIAGNÓSTICO DE PERSISTENCIA ===");

  const keys = getUniqueIdentifier();
  console.log("Device ID actual:", deviceId.value);
  console.log("Browser Fingerprint:", browserFingerprint.value);

  console.log("\n📊 Estado de todas las claves:");
  Object.entries(keys).forEach(([keyName, key]) => {
    const datos = localStorage.getItem(key);
    console.log(
      `${keyName} (${key}):`,
      datos ? JSON.parse(datos) : "❌ No existe"
    );
  });

  console.log("\n🔍 Verificando localStorage general:");
  const allKeys = Object.keys(localStorage);
  const relevantKeys = allKeys.filter(
    (key) =>
      key.includes("pdf") ||
      key.includes("download") ||
      key.includes("device") ||
      key.includes("cv")
  );

  relevantKeys.forEach((key) => {
    try {
      const data = localStorage.getItem(key);
      console.log(
        `${key}: ${
          data ? (data.length > 100 ? "Datos complejos" : data) : "Vacío"
        }`
      );
    } catch (e) {
      console.log(`${key}: Error al leer`);
    }
  });

  console.log("\n📱 Info del navegador:");
  console.log("UserAgent:", navigator.userAgent.slice(0, 50) + "...");
  console.log("Resolución:", `${screen.width}x${screen.height}`);
  console.log("Idioma:", navigator.language);
  console.log("Zona horaria offset:", new Date().getTimezoneOffset());

  // Test de escritura en localStorage
  try {
    const testKey = `test_write_${Date.now()}`;
    const testData = { test: true, timestamp: Date.now() };
    localStorage.setItem(testKey, JSON.stringify(testData));

    const retrieved = localStorage.getItem(testKey);
    if (retrieved && JSON.parse(retrieved).test) {
      console.log("✅ localStorage funciona correctamente");
      localStorage.removeItem(testKey);
    } else {
      console.log("❌ localStorage no funciona correctamente");
    }
  } catch (e) {
    console.log("❌ Error escribiendo en localStorage:", e);
  }
}

// Función administrativa para verificar el estado del contador
function verificarContador() {
  const keys = getUniqueIdentifier();

  console.log("=== ESTADO DEL CONTADOR PDF ===");
  console.log("Device ID:", deviceId.value);
  console.log("Browser Fingerprint:", browserFingerprint.value);
  console.log("Descargas usadas:", descargasUsadas.value);
  console.log("Límite:", limiteDescargas.value);

  console.log("\n--- Claves de almacenamiento ---");
  Object.entries(keys).forEach(([keyName, key]) => {
    const datos = localStorage.getItem(key);
    console.log(
      `${keyName} (${key}):`,
      datos ? JSON.parse(datos) : "No existe"
    );
  });

  console.log("\n--- Registros de auditoría ---");
  const auditKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("pdf_audit_")
  );
  auditKeys.forEach((key) => {
    const datos = localStorage.getItem(key);
    console.log(key, JSON.parse(datos));
  });
}

// Función para verificar y sincronizar contadores entre claves
function sincronizarContadores() {
  const keys = getUniqueIdentifier();
  let maxUsadas = 0;

  // Encontrar el valor más alto de descargas usadas entre todas las claves
  Object.entries(keys).forEach(([keyName, key]) => {
    const datos = localStorage.getItem(key);
    if (datos) {
      try {
        const info = JSON.parse(datos);
        if (info.usadas > maxUsadas) {
          maxUsadas = info.usadas;
        }
      } catch (e) {
        console.warn(`Error al parsear datos de ${keyName}:`, e);
      }
    }
  });

  // Actualizar con el valor más alto y sincronizar todas las claves
  if (maxUsadas > descargasUsadas.value) {
    descargasUsadas.value = maxUsadas;
    guardarContadorDescargas();
    console.log(`Contador sincronizado a: ${maxUsadas}`);
  }
}

// Exponer funciones para uso en consola (desarrollo)
if (import.meta.env.DEV) {
  window.resetearContadorPDF = resetearContador;
  window.verificarContadorPDF = verificarContador;
  window.sincronizarContadores = sincronizarContadores;
  window.diagnosticarPersistencia = diagnosticarPersistencia;
}

// Ejecutar sincronización al cargar y diagnosticar en desarrollo
onMounted(async () => {
  await nextTick();

  // En desarrollo, mostrar diagnóstico
  if (import.meta.env.DEV) {
    setTimeout(() => {
      diagnosticarPersistencia();
    }, 1000);
  }

  sincronizarContadores();

  // Verificar cada 30 segundos si el contador sigue ahí
  setInterval(() => {
    if (descargasUsadas.value > 0) {
      const keys = getUniqueIdentifier();
      let encontrado = false;

      Object.entries(keys).forEach(([keyName, key]) => {
        if (localStorage.getItem(key)) {
          encontrado = true;
        }
      });

      if (!encontrado) {
        console.warn("🚨 ADVERTENCIA: Contador perdido, restaurando...");
        guardarContadorDescargas();
      }
    }
  }, 30000);
});
</script>

<style>
.pdf-root {
  background: #fff;
  padding: 0.3in;
}

/* Fuerza salto de página entre cartas sin crear página en blanco al inicio/fin */
.carta {
  page-break-after: always;
}
.carta:last-child {
  page-break-after: auto;
}

/* Botón rectangular fijo "Generar PDF" */
.pdf-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 18px;
  min-width: 180px;
  border-radius: 12px;
  border: none;
  outline: none;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  z-index: 1000;
}

.pdf-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.pdf-button:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.pdf-button.limite-alcanzado {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  cursor: pointer;
  opacity: 1;
}

.pdf-button.limite-alcanzado:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
}
.btn-text {
  font-size: 14px;
}

/* Contador visual */
.contador-info {
  position: fixed;
  right: 24px;
  bottom: 90px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #666;
  z-index: 999;
}

.contador-text {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.contador-barra {
  width: 120px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.contador-progreso {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  color: #ef4444;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
  line-height: 1.6;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #374151;
}

.contact-info {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  font-size: 1rem;
}

.note {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.debug-info {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Ocultar elementos marcados solo en generación PDF */
.generando-pdf .no-imprimir {
  display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .contador-info {
    right: 16px;
    bottom: 80px;
  }

  .pdf-button {
    right: 16px;
    bottom: 16px;
    min-width: 160px;
  }
}
</style>
