import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@js/firebase";

export default function LoginNovios() {
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        window.location.href = "/novios";
      }
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
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
      </div>
    </div>
  );
}
