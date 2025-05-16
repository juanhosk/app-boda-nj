import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth"; // Importación solo para tipos

import { auth } from "../../firebase";

// Iniciar sesión anónima
export const iniciarSesionAnonima = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    console.log("Usuario anónimo autenticado:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error en autenticación anónima:", error);
    return null;
  }
};

// Observar estado de autenticación
export const observarAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Cerrar sesión
export const cerrarSesion = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
