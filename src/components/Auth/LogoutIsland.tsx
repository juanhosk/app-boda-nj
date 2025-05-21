// src/components/Auth/LogoutButton.tsx
import { signOut } from "firebase/auth";
import { auth } from "@js/firebase";

export default function LogoutButton() {
  const handleLogout = async () => {
    localStorage.removeItem("invitado");
    localStorage.removeItem("invitadoActual");
    localStorage.clear();

    try {
      await signOut(auth); // Si no está logueado, no hace nada
    } catch (e) {
      console.warn("No hay sesión Firebase activa o ya cerrada.");
    }

    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm shadow hover:bg-stone-100 transition"
    >
      Cerrar sesión
    </button>
  );
}
