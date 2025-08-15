// src/stores/hojaVida.js
import { defineStore } from "pinia";
import { obtenerHojaDeVida } from "../api/datosAPI";
import { obtenerFirmaServidor, guardarFirmaServidor } from '../api/datosAPI';

export const useHojaVidaStore = defineStore("hojaVida", {
  state: () => ({
    datosPersonales: null,
    formacionAcademica: null,
    experiencia: null,
    firmaServidor: null,
    cargado: false, // NUEVO: control de carga
  }),
  actions: {
    async cargarHojaDeVida() {
      try {
        const data = await obtenerHojaDeVida();
        console.log("📦 Datos recibidos del backend:", data);
        this.datosPersonales = data.datosPersonales;
        this.formacionAcademica = data.formacionAcademica;
        this.experiencia = data.experiencia;
      } catch (error) {
        console.warn("⚠️ No se encontraron datos, usuario nuevo:", error?.response?.data || error.message);
        this.datosPersonales = {};  // fallback vacío
        this.formacionAcademica = {}; // fallback vacío
        this.experiencia = {}; // fallback vacío
      } finally {
        this.cargado = true; // Siempre marcar como cargado
      }
    },
    async cargarFirmaServidor() {
      try {
        const { data } = await obtenerFirmaServidor();
        this.firmaServidor = data;
      } catch (error) {
        console.error("Error al cargar firma:", error);
      }
    },
    async guardarFirmaServidor(payload) {
      try {
        const { data } = await guardarFirmaServidor(payload);
        this.firmaServidor = data.data;
      } catch (error) {
        console.error("Error al guardar firma:", error);
      }
    }
  },
});


