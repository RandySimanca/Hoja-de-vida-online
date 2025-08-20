import axios from "axios";
import api from "../api/axios";

export const login = async (email, password) => {
  try {
    // Usamos la ruta relativa '/login' para que axios use la baseURL correcta.
    // También enviamos 'correo' en lugar de 'email'.
    const response = await api.post("/login", {
      correo: email,
      password,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data?.error || "Error de conexión";
  }
};

const email = ref("");
const password = ref("");
const error = ref("");






const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const { token, usuario } = await login(email.value, password.value);

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    router.push("/panel/Hoja2");
  } catch (e) {
    error.value = typeof e === "string" ? e : e.message || "Error inesperados";
    console.error("Login fallido:", e);
  } finally {
    loading.value = false;
  }
};
