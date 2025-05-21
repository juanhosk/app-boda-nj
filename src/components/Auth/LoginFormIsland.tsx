import { useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc } from "firebase/firestore";
import { navigate } from "astro:transitions/client";

export default function LoginFormIsland() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const trimmedCode = code.trim();

      const ref = doc(db, "invitados", trimmedCode);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        localStorage.setItem("invitado", JSON.stringify({ code: trimmedCode, ...snap.data() }));
        navigate("/privado");
      } else {
        setError("Lo sentimos, el código no es válido. Por favor, revísalo o vuelve a la página principal.");
      }
    } catch (err) {
      console.error("Error al verificar el código:", err);
      setError("Ha ocurrido un error al verificar el código. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Tu código (ej. 001noeliarosell)"
          className="w-full border border-stone-300 rounded-md p-3 text-base"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-primary-500 text-white px-6 py-2 rounded-md w-full font-medium"
          disabled={loading}
        >
          {loading ? "Comprobando..." : "Entrar"}
        </button>
      </form>

      {error && (
        <div className="mt-6 bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 text-sm space-y-2">
          <p>{error}</p>
          <a
            href="/"
            className="inline-block mt-2 text-primary-500 font-semibold hover:underline"
          >
            ← Volver a la página principal
          </a>
        </div>
      )}
    </div>
  );
}
