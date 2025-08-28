<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>{{ modoRegistro ? "Crear cuenta" : "Bienvenido" }}</h2>
      <p>
        {{
          modoRegistro
            ? "Completa tus datos para registrarte"
            : "Inicia sesión para acceder a tu panel"
        }}
      </p>

      <form @submit.prevent="modoRegistro ? handleRegister() : handleLogin()">
        <!-- Email -->
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          autocomplete="email"
        />

        <!-- Password -->
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          autocomplete="current-password"
        />

        <!-- Nombre completo (solo para registro) -->
        <input
          v-if="modoRegistro"
          v-model="nombre"
          type="text"
          placeholder="Nombre completo"
          autocomplete="name"
        />

        <button type="submit" :disabled="loading">
          {{
            loading
              ? modoRegistro
                ? "Registrando..."
                : "Ingresando..."
              : modoRegistro
              ? "Registrate"
              : "Entrar"
          }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <p>
        {{ modoRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?" }}
        <button @click="modoRegistro = !modoRegistro" class="toggle-btn">
          {{ modoRegistro ? "Entrar" : "Registrarme" }}
        </button>
      </p>
    </div>

    <!-- Pie de página -->
    <footer class="login-footer">
      <div class="footer-content">
        <div class="contact-info">
          <h4>Información de Contacto</h4>
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>Randy Simanca</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>+57 314 519 3285</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <span>Pueblo Nuevo - Cordoba, Colombia</span>
          </div>
        </div>
        
        <div class="social-links">
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">LinkedIn</a>
          <a href="#" class="social-link">Twitter</a>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 Randy Simanca. Todos los derechos reservados.</p>
          <div class="footer-links">
            <a href="#">Términos de Servicio</a>
            <a href="#">Política de Privacidad</a>
            <a href="#">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../api/axios"; 
import { useHojaVidaStore } from "../stores/hojaVida";

const email = ref("");
const password = ref("");
const nombre = ref("");
const error = ref("");
const loading = ref(false);
const modoRegistro = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Completa todos los campos";
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post("/login", {
      email: email.value,
      password: password.value,
    });

    const { token, usuario } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    const hojaStore = useHojaVidaStore();
    await hojaStore.cargarHojaDeVida();

    router.push(usuario.roles.includes("admin") ? "/admin" : "/panel/Hoja1");
  } catch (e) {
    error.value =
      e.response?.data?.mensaje || "Error de conexión: " + e.message;
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  error.value = "";
  if (!email.value || !password.value || !nombre.value) {
    error.value = "Completa todos los campos para registrarte";
    return;
  }

  loading.value = true;
  try {
    await axios.post("/usuarios", {
      email: email.value,
      password: password.value,
      nombre: nombre.value,
      roles: ["usuario"],
    });

    modoRegistro.value = false;
    error.value = "Registro exitoso. Ahora puedes iniciar sesión.";
  } catch (e) {
    error.value = e.response?.data?.mensaje || "Error al registrar";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff, #fff);
  padding: 2rem 0;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
  margin: auto 0;
}

.login-card h2 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  color: #3730a3;
}

.login-card p {
  margin-bottom: 2rem;
  color: #555;
}

form input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 5px;
  font-size: 1rem;
}

form button {
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

form button:hover {
  background: #4338ca;
}

form button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.toggle-btn {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  text-decoration: underline;
  font-weight: bold;
}

.toggle-btn:hover {
  color: #4338ca;
}

.error {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}

/* Estilos del pie de página */
.login-footer {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e5e7eb;
  backdrop-filter: blur(10px);
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.contact-info {
  margin-bottom: 1.5rem;
}

.contact-info h4 {
  color: #3730a3;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem 0.5rem 0;
  color: #555;
  font-size: 0.9rem;
}

.contact-icon {
  font-size: 1rem;
}

.social-links {
  margin-bottom: 1.5rem;
}

.social-link {
  display: inline-block;
  margin: 0 1rem;
  padding: 0.5rem 1rem;
  color: #4f46e5;
  text-decoration: none;
  border: 1px solid #4f46e5;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #4f46e5;
  color: white;
}

.footer-bottom {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.footer-bottom p {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #4f46e5;
}

/* Responsivo */
@media (max-width: 768px) {
  .login-wrapper {
    padding: 1rem;
  }
  
  .contact-item {
    display: block;
    margin: 0.5rem 0;
  }
  
  .social-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  
  .social-link {
    margin: 0;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
