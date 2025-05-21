import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@js/firebase";
import { navigate } from "astro:transitions/client";

export default function LoginNovios() {
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setError(null); // Reset error before trying
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate("/novios");
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo o contacta con Juanjo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-700 mb-4 text-center">Zona exclusiva para los novios 💍</h1>
        <p className="text-stone-500 text-sm text-center mb-6">Accede con tu cuenta de Google</p>
        <button
          onClick={login}
          className="flex items-center justify-center gap-3 w-full bg-white border border-stone-300 rounded-xl px-4 py-2 shadow-sm hover:bg-stone-100 transition"
        >
          <img src="/favicons/google.png" alt="Google icon" className="w-5 h-5" />
          <span className="text-stone-700 font-medium">Entrar con Google</span>
        </button>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded-md p-3 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
