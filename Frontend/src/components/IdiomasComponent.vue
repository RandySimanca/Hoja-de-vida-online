<template>
  <form @submit.prevent="enviarFormulario">
    <div class="section section-idiomas-compacta">
      <div class="section-title">
        <span class="section-number">3</span> IDIOMAS
      </div>
      <div class="form-group">
        <p class="p texto-explicativo-compacto">
          ESPECIFIQUE LOS IDIOMAS DIFERENTES AL ESPAÑOL QUE: HABLA, LEE, ESCRIBE
          DE FORMA, REGULAR (R), BIEN (B), O MUY BIEN (MB)
        </p>
      </div>

      <!-- Tabla solo se muestra si hay idiomas -->
      <div v-if="idiomas.length > 0" class="tabla-container">
        <table class="table tabla-idiomas-compacta">
          <thead>
            <tr>
              <th rowspan="2" class="columna-idioma">IDIOMA</th>
              <th colspan="3" class="grupo-habilidad">LO HABLA</th>
              <th colspan="3" class="grupo-habilidad">LO LEE</th>
              <th colspan="3" class="grupo-habilidad">LO ESCRIBE</th>
              <th rowspan="2" class="columna-acciones">ACCIONES</th>
            </tr>
            <tr>
              <th class="nivel-header">R</th>
              <th class="nivel-header">B</th>
              <th class="nivel-header">MB</th>
              <th class="nivel-header">R</th>
              <th class="nivel-header">B</th>
              <th class="nivel-header">MB</th>
              <th class="nivel-header">R</th>
              <th class="nivel-header">B</th>
              <th class="nivel-header">MB</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(idioma, index) in idiomas" :key="index" class="fila-idioma">
              <td class="celda-nombre-idioma">
                <input
                  class="form-control input-idioma"
                  v-model="idioma.nombre"
                  placeholder="Ej: Inglés"
                />
              </td>
              <!-- Lo Habla -->
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'R'"
                  :name="'habla-' + index"
                  v-model="idioma.habla"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'B'"
                  :name="'habla-' + index"
                  v-model="idioma.habla"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'MB'"
                  :name="'habla-' + index"
                  v-model="idioma.habla"
                  class="radio-compacto"
                />
              </td>
              <!-- Lo Lee -->
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'R'"
                  :name="'lee-' + index"
                  v-model="idioma.lee"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'B'"
                  :name="'lee-' + index"
                  v-model="idioma.lee"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'MB'"
                  :name="'lee-' + index"
                  v-model="idioma.lee"
                  class="radio-compacto"
                />
              </td>
              <!-- Lo Escribe -->
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'R'"
                  :name="'escribe-' + index"
                  v-model="idioma.escribe"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'B'"
                  :name="'escribe-' + index"
                  v-model="idioma.escribe"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-radio">
                <input
                  type="radio"
                  :value="'MB'"
                  :name="'escribe-' + index"
                  v-model="idioma.escribe"
                  class="radio-compacto"
                />
              </td>
              <td class="celda-acciones">
                <button
                  class="boton-eliminar no-imprimir"
                  @click.prevent="removeIdioma(index)"
                  title="Eliminar idioma"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje cuando no hay idiomas -->
      <div v-else class="sin-idiomas-mensaje">
      
      </div>

      <div class="botones-accion no-imprimir">
        <button
          type="button"
          class="boton-guardar boton-agregar"
          @click="addIdioma"
        >
          Agregar Idioma
        </button>

        <button
          type="submit"
          class="boton-guardar boton-guardar-idiomas"
          v-if="idiomas.length > 0"
        >
          Guardar Idiomas
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import api from "../api/axios";
import { showSuccess, showError } from "../utils/showMessage.js";

export default {
  name: "IdiomasComponent",
  data() {
    return {
      idiomas: [], // ✅ Array vacío por defecto - sin filas iniciales
      modoEdicion: false,
      docId: null, // To store the document ID if in edit mode
    };
  },
  mounted() {
    this.cargarDatos();
  },
  methods: {
    addIdioma() {
      // ✅ Crear nueva fila de idioma
      const nuevoIdioma = { 
        nombre: "", 
        habla: "", 
        lee: "", 
        escribe: "" 
      };
      
      this.idiomas.push(nuevoIdioma);
      
      // Scroll suave hacia la nueva fila (opcional)
      this.$nextTick(() => {
        const tabla = document.querySelector('.tabla-idiomas-compacta tbody');
        if (tabla && tabla.lastElementChild) {
          tabla.lastElementChild.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      });
      
      console.log(`✅ Idioma agregado. Total: ${this.idiomas.length}`);
    },
    
    async removeIdioma(index) {
  if (this.idiomas.length === 0) {
    showError("⚠️ No hay idiomas para eliminar.");
    return;
  }

  try {
    // Eliminar del estado local
    this.idiomas.splice(index, 1);
    
    // Si estamos en modo edición (hay un documento guardado), actualizar la BD
    if (this.modoEdicion && this.docId) {
      const payload = { idiomas: this.idiomas };
      await api.put(`/idiomas/${this.docId}`, payload);
    }
    
    if (this.idiomas.length === 0) {
      showSuccess("✅ Todos los idiomas eliminados. La tabla está ahora vacía.");
    } else {
      showSuccess(`✅ Idioma eliminado. Quedan ${this.idiomas.length} idioma(s).`);
    }
    
    console.log(`🗑️ Idioma eliminado y guardado. Total restante: ${this.idiomas.length}`);
    
  } catch (error) {
    console.error("❌ Error al eliminar el idioma:", error);
    showError("Error al eliminar el idioma de la base de datos.");
    
    // Revertir cambios en caso de error
    this.cargarDatos();
  }
},
    
    async cargarDatos() {
      try {
        const response = await api.get("/idiomas");
        if (response.data && response.data.idiomas) {
          // ✅ Solo cargar si realmente hay idiomas guardados
          if (response.data.idiomas.length > 0) {
            this.idiomas = response.data.idiomas;
            this.docId = response.data._id;
            this.modoEdicion = true;
            console.log(`✅ ${this.idiomas.length} idioma(s) cargado(s) desde el servidor`);
          } else {
            // Si el array está vacío en el servidor, mantener vacío localmente
            this.idiomas = [];
            this.modoEdicion = false;
            console.log("ℹ️ No hay idiomas guardados en el servidor");
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.modoEdicion = false;
          this.idiomas = []; // ✅ Mantener vacío si no existe el documento
          console.log("ℹ️ No se encontraron datos de idiomas (404)");
        } else {
          console.error("❌ Error al cargar los idiomas:", error);
          showError("No se pudieron cargar los datos de idiomas.");
        }
      }
    },
    
    async enviarFormulario() {
      // ✅ Validación: solo permitir guardar si hay al menos un idioma
      if (this.idiomas.length === 0) {
        showError("⚠️ Debe agregar al menos un idioma antes de guardar.");
        return;
      }

      // ✅ Validación: verificar que los idiomas tengan datos mínimos
      const idiomasValidos = this.idiomas.filter(idioma => 
        idioma.nombre && idioma.nombre.trim() !== ""
      );

      if (idiomasValidos.length === 0) {
        showError("⚠️ Debe completar al menos el nombre de un idioma.");
        return;
      }

      try {
        let response;
        const payload = { idiomas: this.idiomas };

        if (this.modoEdicion) {
          response = await api.put(`/idiomas/${this.docId}`, payload);
          showSuccess("✅ ¡Idiomas actualizados correctamente!");
        } else {
          response = await api.post("/idiomas", payload);
          showSuccess("✅ ¡Idiomas guardados correctamente!");
          this.docId = response.data.data._id;
          this.modoEdicion = true;
        }
        
        console.log(`✅ ${this.idiomas.length} idioma(s) guardado(s) exitosamente`);
      } catch (error) {
        console.error("❌ Error al guardar los idiomas:", error);
        showError("Ocurrió un error al guardar los idiomas.");
      }
    },
  },
};
</script>

<style scoped>
/* ===== ESTILOS COMPACTOS PARA IDIOMAS ===== */
.section-idiomas-compacta {
  padding: 0.5rem !important;
  margin-bottom: 0.3rem !important;
}

.texto-explicativo-compacto {
  font-size: 9px !important;
  line-height: 1.2 !important;
  margin-bottom: 0.3rem !important;
  color: #555;
}

.tabla-idiomas-compacta {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.5rem !important;
  font-size: 9px !important;
}

.tabla-idiomas-compacta th,
.tabla-idiomas-compacta td {
  text-align: center;
  vertical-align: middle;
  padding: 2px !important;
  border: 1px solid #ccc;
}

.tabla-idiomas-compacta th {
  font-weight: bold;
  background-color: #f5f5f5;
  font-size: 8px !important;
}

/* Columnas específicas */
.columna-idioma {
  width: 25% !important;
  text-align: left !important;
  font-size: 8px !important;
}

.grupo-habilidad {
  font-size: 8px !important;
  background-color: #f0f8ff !important;
}

.nivel-header {
  width: 4% !important;
  font-size: 7px !important;
  padding: 1px !important;
}

.columna-acciones {
  width: 8% !important;
  font-size: 7px !important;
}

/* Celdas de la tabla */
.celda-nombre-idioma {
  text-align: left !important;
  padding: 1px !important;
}

.celda-radio {
  padding: 1px !important;
  text-align: center !important;
}

.celda-acciones {
  padding: 1px !important;
  text-align: center !important;
}

/* Inputs */
.input-idioma {
  width: 100% !important;
  padding: 2px !important;
  font-size: 9px !important;
  height: 20px !important;
  border: 1px solid #ccc;
  border-radius: 2px;
}

.radio-compacto {
  margin: 0 !important;
  transform: scale(0.8);
}

/* Botones */
.botones-accion {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.boton-agregar,
.boton-guardar-idiomas {
  padding: 6px 12px !important;
  font-size: 11px !important;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.boton-agregar {
  background-color: #17a2b8 !important;
  color: white;
}

.boton-agregar:hover {
  background-color: #138496 !important;
}

.boton-guardar-idiomas {
  background-color: #28a745 !important;
  color: white;
}

.boton-guardar-idiomas:hover {
  background-color: #218838 !important;
}

.boton-eliminar {
  background: none !important;
  border: none !important;
  font-size: 10px !important;
  cursor: pointer;
  padding: 1px !important;
}

.boton-eliminar:hover {
  opacity: 0.7;
}

.fila-idioma:nth-child(even) {
  background-color: #f9f9f9;
}

/* Responsive para impresión */
@media print {
  .section-idiomas-compacta {
    padding: 0.2rem !important;
    margin-bottom: 0.1rem !important;
    page-break-inside: avoid;
  }
  
  .tabla-idiomas-compacta {
    font-size: 8px !important;
  }
  
  .tabla-idiomas-compacta th,
  .tabla-idiomas-compacta td {
    padding: 1px !important;
  }
  
  .texto-explicativo-compacto {
    font-size: 8px !important;
  }
  
  .input-idioma {
    font-size: 8px !important;
    height: 16px !important;
  }
  
  .no-imprimir {
    display: none !important;
  }
}

/* Ajustes específicos para la primera página */
@media screen {
  .section-idiomas-compacta {
    max-height: 200px; /* Limitar altura para que quepa en la página */
    overflow: visible;
  }
}
</style>