import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@js/firebase";

export default function LoginNovios() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Evita que el form recargue la página
    setLoading(true);
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        window.location.href = "/novios";
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-700 mb-4 text-center">Zona exclusiva para los novios 💍</h1>
        <p className="text-stone-500 text-sm text-center mb-6">Accede con tu correo y contraseña</p>

        <form className="space-y-4" onSubmit={login}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border border-stone-300 rounded-md p-3 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border border-stone-300 rounded-md p-3 text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl px-4 py-2 transition"
            disabled={loading}
          >
            {loading ? "Accediendo..." : "Entrar"}
          </button>
          {error && <p className="text-red-600 text-sm text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
