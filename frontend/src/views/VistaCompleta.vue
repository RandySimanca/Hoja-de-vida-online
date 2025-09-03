<template>
  <div>
    <div id="documento-pdf" ref="documento" class="pdf-root" :class="{ 'generando-pdf': generando }">
      <Hoja1 />
      <Hoja2 />
      <Hoja3 />
    </div>
    <button
      class="pdf-button"
      :disabled="generando"
      :aria-busy="generando ? 'true' : 'false'"
      @click="generarPDF"
      title="Generar PDF"
    >
      <span v-if="!generando" class="btn-icon" aria-hidden="true">📄</span>
      <span v-else class="spinner" aria-hidden="true"></span>
      <span class="btn-text">{{ generando ? 'Generando...' : 'Generar PDF' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import html2pdf from 'html2pdf.js';
import Hoja1 from './Hoja1.vue';
import Hoja2 from './Hoja2.vue';
import Hoja3 from './Hoja3.vue';
import { useRoute } from 'vue-router';
import { useUsuarioStore } from '../stores/usuarios';

const documento = ref(null);
const generando = ref(false);

import { onMounted } from 'vue';
const nombre = ref('Invitado');
const route = useRoute();
const usuarioStore = useUsuarioStore();

onMounted(() => {
  const datos = JSON.parse(localStorage.getItem('usuario'));
  if (datos?.nombre) nombre.value = datos.nombre;
});

async function generarPDF() {
  // Asegurar que el DOM y recursos estén listos
  await nextTick();
  await new Promise(r => setTimeout(r, 150));
  generando.value = true;
  const opciones = {
    margin: 0,
    filename: 'hoja-de-vida.pdf',
    image: { type: 'pdf', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  try {
    await html2pdf()
      .set(opciones)
      .from(documento.value)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
  const total = pdf.internal.getNumberOfPages();
  if (total > 1) {
    pdf.deletePage(total);
  }

  const nombreUsuario = nombre.value?.trim() || 'usuario';
  const nombreArchivo = `hoja de vida ${nombreUsuario}.pdf`;
  pdf.save(nombreArchivo);
});

  } finally {
    generando.value = false;
  }
}
</script>

<style>
.pdf-root { background: #fff; padding: 0.3in; }

/* Fuerza salto de página entre cartas sin crear página en blanco al inicio/fin */
.carta { page-break-after: always; }
.carta:last-child { page-break-after: auto; }

/* Botón rectangular fijo "Generar PDF" */
.pdf-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 18px;
  min-width: 160px;
  border-radius: 12px;
  border: none;
  outline: none;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  z-index: 1000;
}
.pdf-button:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.25); }
.pdf-button:disabled { opacity: 0.75; cursor: not-allowed; transform: none; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.btn-icon { font-size: 18px; line-height: 1; }
.btn-text { font-size: 14px; }

/* Spinner minimal */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Ocultar elementos marcados solo en generación PDF */
.generando-pdf .no-imprimir { display: none !important; }
</style>