<template>
  <form @submit.prevent="enviarFormulario">
    <div class="section">
      <div class="section-title">
        <span class="section-number">2</span> FORMACIÓN ACADÉMICA
      </div>

      <div class="form-group">
        <label>EDUCACIÓN BÁSICA Y MEDIA</label>
        <p class="p">
          MARQUE CON UNA X EL ÚLTIMO GRADO APROBADO (LOS GRADOS DE 1o. A 6o. DE
          BACHILLERATO EQUIVALEN A LOS GRADOS 6o. A 11o. DE EDUCACIÓN BÁSICA
          SECUNDARIA Y MEDIA)
        </p>
      </div>

      <div class="form-row">
        <div class="form-group col-3">
          <label>EDUCACIÓN BÁSICA</label>
          <div style="display: flex; margin-top: 5px">
            <div class="form-group col-2">
              <label for="primaria">PRIMARIA</label>
              <div style="display: flex; margin-top: 5px">
                <div class="checkbox-group" v-for="n in 5" :key="n">
                  <input
                    type="checkbox"
                    :id="`grado-${n}`"
                    name="grado"
                    :checked="selectedGrado === n"
                    @change="selectGrado(n)"
                  />
                  <label :for="`grado-${n}`">{{ n }}o.</label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group col-2">
            <label for="secundaria">SECUNDARIA</label>
          </div>
          <div style="display: flex; margin-top: 5px">
            <div class="checkbox-group" v-for="n in [6, 7, 8, 9,10,11]" :key="n">
              <input
                type="checkbox"
                :id="`grado-${n}`"
                name="grado"
                :checked="selectedGrado === n"
                @change="selectGrado(n)"
              />
              <label :for="`grado-${n}`">{{ n }}o.</label>
            </div>
          </div>
        </div>

        <div class="form-group col-2">
          <label for="titulo-bachiller">TÍTULO OBTENIDO:</label>
          <h2></h2>
          <input
            type="text"
            id="titulo-bachiller"
            class="form-control"
            v-model="tituloBachiller"
          />
        </div>

        <div class="form-group col-2">
          <label>FECHA DE GRADO</label>
          <div style="display: flex; margin-top: 5px">
            <div
              class="form-group col-2"
              style="width: 60px; margin-right: 5px"
            >
              <label for="mes-grado">MES</label>
              <select id="mes-grado" class="form-control" v-model="mesGrado">
                <option disabled value="">Selecciona un mes</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <div class="form-group col-2" style="width: 60px">
              <label for="ano-grado">AÑO</label>
              <input
                type="text"
                id="ano-grado"
                class="form-control"
                v-model="anioGrado"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>EDUCACION SUPERIOR (PREGRADO Y POSTGRADO)</label>
        <p class="p">
          DILIGENCIE ESTE PUNTO EN ESTRICTO ORDEN CRONOLÓGICO, EN MODALIDAD
          ACADÉMICA ESCRIBA: TC (TÉCNICA), TL (TECNOLÓGICA), TE (TECNOLÓGICA
          ESPECIALIZADA), UN (UNIVERSITARIA), ES (ESPECIALIZACIÓN), MG (MAESTRÍA
          O MAGISTER), DOC (DOCTORADO O PHD), RELACIONE AL FRENTE EL NÚMERO DE
          LA TARJETA PROFESIONAL (SI ÉSTA HA SIDO PREVISTA EN UNA LEY).
        </p>
      </div>

      <!-- Tabla solo se muestra si hay formaciones -->
      <div v-if="formacionesSuperior.length > 0" class="tabla-container">
        <table class="table">
          <thead>
            <tr>
              <th>MODALIDAD ACADÉMICA</th>
              <th>No. SEMESTRES APROBADOS</th>
              <th colspan="2">GRADUADO</th>
              <th>NOMBRE DE LOS ESTUDIOS O TÍTULO OBTENIDO</th>
              <th colspan="2">TERMINACIÓN</th>
              <th>No. DE TARJETA PROFESIONAL</th>
              <th>ACCIONES</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th>SI</th>
              <th>NO</th>
              <th></th>
              <th>MES</th>
              <th>AÑO</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(formacion, index) in formacionesSuperior" :key="index">
              <td>
                <input class="form-control" v-model="formacion.modalidad" />
              </td>
              <td>
                <input class="form-control" v-model="formacion.semestres" />
              </td>
              <td>
                <input 
                  type="radio" 
                  :value="'SI'" 
                  v-model="formacion.graduado" 
                  :name="'graduado-' + index"
                />
              </td>
              <td>
                <input 
                  type="radio" 
                  :value="'NO'" 
                  v-model="formacion.graduado" 
                  :name="'graduado-' + index"
                />
              </td>
              <td><input class="form-control" v-model="formacion.titulo" /></td>
              <td>
                <input class="form-control" v-model="formacion.mesTermino" />
              </td>
              <td>
                <input class="form-control" v-model="formacion.anioTermino" />
              </td>
              <td><input class="form-control" v-model="formacion.tarjeta" /></td>
              <td>
                <button
                  class="btn btn-danger btn-sm no-imprimir"
                  @click.prevent="removeFormacion(index)"
                  title="Eliminar formación"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje cuando no hay formaciones -->
      

      <div class="botones-accion no-imprimir">
        <button type="button" class="boton-guardar boton-agregar" @click="addFormacion">
           Agregar Formación Superior
        </button>

        <button 
          type="submit" 
          class="boton-guardar boton-guardar-formacion" 
          style="margin-left: 10px;"
        >
          {{ modoEdicion ? 'Guardar ó Actualizar Formación Académica' : 'Guardar Formación Académica'}}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import api from "../api/axios";
import { showSuccess, showError, showWarning, showConfirm } from "../utils/showMessage.js";
import { eliminarFormacionSuperior } from "../api/datosAPI";

export default {
  name: "FormacionAcadComponent",
  props: {
    formacion: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedGrado: null,
      tituloBachiller: "",
      mesGrado: "",
      anioGrado: "",

      // ✅ Array vacío por defecto - sin filas iniciales
      formacionesSuperior: [],

      envioExitoso: false,
      errorEnvio: null,
      cargando: false,
      modoEdicion: false,
      formacionId: null,
    };
  },
  mounted() {
    if (this.formacion && Object.keys(this.formacion).length > 0) {
      this.cargarDatosDesdeProps();
    } else {
      this.cargarDatos();
    }
  },
  methods: {
    selectGrado(n) {
      this.selectedGrado = this.selectedGrado === n ? null : n;
    },
    
    // ✅ Crear nueva formación vacía
    addFormacion() {
      const nuevaFormacion = {
        modalidad: "",
        semestres: "",
        graduado: "",
        titulo: "",
        mesTermino: "",
        anioTermino: "",
        tarjeta: "",
      };
      
      this.formacionesSuperior.push(nuevaFormacion);
      
      // Scroll suave hacia la nueva fila
      this.$nextTick(() => {
        const tabla = document.querySelector('.table tbody');
        if (tabla && tabla.lastElementChild) {
          tabla.lastElementChild.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      });
      
      console.log(`✅ Formación agregada. Total: ${this.formacionesSuperior.length}`);
    },

    cargarDatosDesdeProps() {
      this.selectedGrado = this.formacion.gradoBasica || null;
      this.tituloBachiller = this.formacion.tituloBachiller || "";
      this.mesGrado = this.formacion.mesGrado || "";
      this.anioGrado = this.formacion.anioGrado || "";
      
      // ✅ Solo cargar si realmente hay formaciones
      this.formacionesSuperior = this.formacion.formacionesSuperior && 
        this.formacion.formacionesSuperior.length > 0 ? 
        this.formacion.formacionesSuperior : [];
        
      this.modoEdicion = true;
      this.formacionId = this.formacion._id;
    },

    async cargarDatos() {
      try {
        const response = await api.get("/formacion-academica");
        const datos = response.data;
        
        if (datos) {
          this.selectedGrado = datos.gradoBasica || null;
          this.tituloBachiller = datos.tituloBachiller || "";
          this.mesGrado = datos.mesGrado || "";
          this.anioGrado = datos.anioGrado || "";
          
          // ✅ Solo cargar formaciones si existen y no están vacías
          if (datos.formacionesSuperior && datos.formacionesSuperior.length > 0) {
            this.formacionesSuperior = datos.formacionesSuperior;
            console.log(`✅ ${this.formacionesSuperior.length} formación(es) cargada(s)`);
          } else {
            this.formacionesSuperior = [];
            console.log("ℹ️ No hay formaciones superiores guardadas");
          }
          
          this.modoEdicion = true;
          this.formacionId = datos._id;
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.modoEdicion = false;
          this.formacionesSuperior = []; // ✅ Mantener vacío
          console.log("ℹ️ No se encontraron datos de formación (404)");
        } else {
          console.error("❌ Error al cargar datos:", error);
          showError("No se pudieron cargar los datos de formación académica.");
        }
      }
    },

    async enviarFormulario() {
      this.envioExitoso = false;
      this.errorEnvio = null;
      this.cargando = true;

      // Validar campos básicos obligatorios
      if (
        !this.selectedGrado ||
        !this.tituloBachiller ||
        !this.mesGrado ||
        !this.anioGrado
      ) {
        showError("❌ Faltan campos obligatorios de educación básica y media.");
        this.cargando = false;
        return;
      }

      const formacion = {
        gradoBasica: this.selectedGrado,
        tituloBachiller: this.tituloBachiller,
        mesGrado: this.mesGrado,
        anioGrado: this.anioGrado,
        formacionesSuperior: this.formacionesSuperior, // Puede estar vacío
      };

      try {
        let response;
        
        if (this.modoEdicion) {
          response = await api.put("/formacion-academica", formacion);
          showSuccess("✅ ¡Formación académica actualizada correctamente!");
        } else {
          response = await api.post("/formacion-academica", formacion);
          showSuccess("✅ ¡Formación académica guardada correctamente!");
          
          this.modoEdicion = true;
          this.formacionId = response.data.data._id;
        }

        const result = response.data;
        console.log(`✅ Datos guardados con ${this.formacionesSuperior.length} formación(es) superior(es)`);
        this.envioExitoso = true;
        
      } catch (error) {
        console.error(
          "Error al procesar la formación académica:",
          error.response?.data || error.message
        );
        
        if (error.response?.status === 404 && this.modoEdicion) {
          showError("❌ No se encontraron datos para actualizar. Creando nuevo registro...");
          this.modoEdicion = false;
          this.enviarFormulario();
          return;
        }
        
        showError(this.modoEdicion ? 
          "❌ Ocurrió un error al actualizar la formación académica." :
          "❌ Ocurrió un error al guardar la formación académica."
        );
      } finally {
        this.cargando = false;
      }
    },

    // ✅ MÉTODO CORREGIDO - Eliminación inmediata sin filas mínimas
    async removeFormacion(index) {
      if (this.formacionesSuperior.length === 0) {
        showError("⚠️ No hay formaciones para eliminar.");
        return;
      }

      const formacion = this.formacionesSuperior[index];
      
      // Confirmación antes de eliminar
      const confirmacion = await showConfirm({
        title: 'Eliminar Formación',
        text: '¿Estás seguro de que deseas eliminar esta formación superior?',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (!confirmacion) return;

      try {
        // Eliminar del estado local inmediatamente
        this.formacionesSuperior.splice(index, 1);
        
        // Si hay documento guardado, actualizar la base de datos
        if (this.modoEdicion && this.formacionId) {
          const payload = {
            gradoBasica: this.selectedGrado,
            tituloBachiller: this.tituloBachiller,
            mesGrado: this.mesGrado,
            anioGrado: this.anioGrado,
            formacionesSuperior: this.formacionesSuperior
          };
          
          await api.put("/formacion-academica", payload);
        }
        
        if (this.formacionesSuperior.length === 0) {
          showSuccess("✅ Todas las formaciones eliminadas. La tabla está ahora vacía.");
        } else {
          showSuccess(`✅ Formación eliminada. Quedan ${this.formacionesSuperior.length} formación(es).`);
        }
        
        console.log(`🗑️ Formación eliminada. Total restante: ${this.formacionesSuperior.length}`);
        
      } catch (error) {
        console.error("❌ Error al eliminar la formación:", error);
        showError("Error al eliminar la formación de la base de datos.");
        
        // Recargar datos para mantener consistencia
        await this.cargarDatos();
      }
    },
  },
};
</script>

<style scoped>
/* Estilos adicionales para el nuevo diseño */
.tabla-container {
  margin: 1rem 0;
}

.sin-formaciones-mensaje {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.25rem;
  margin: 1rem 0;
}

.texto-sin-datos {
  color: #6c757d;
  font-style: italic;
  margin: 0;
}

.botones-accion {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.boton-agregar {
  background-color: #17a2b8 !important;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.boton-agregar:hover {
  background-color: #138496 !important;
}

.boton-guardar-formacion {
  background-color: #28a745 !important;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.boton-guardar-formacion:hover {
  background-color: #218838 !important;
}

/* Responsive para impresión */
@media print {
  .no-imprimir {
    display: none !important;
  }
  
  .sin-formaciones-mensaje {
    display: none !important;
  }
}
</style>
