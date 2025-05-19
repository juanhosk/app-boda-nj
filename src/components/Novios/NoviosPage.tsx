import { useEffect, useState } from "react";
import { auth } from "@js/firebase";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const db = getFirestore();

export default function NoviosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [invitadoData, setInvitadoData] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const logoutAndRedirect = async () => {
    localStorage.removeItem("invitadoActual");
    await signOut(auth);
    window.location.href = "/loginNovios";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      const cached = localStorage.getItem("invitado");

      if (!u && !cached) {
        // No hay sesión ni cache → redirige
        setAuthChecked(true);
        window.location.href = "/loginNovios";
        return;
      }

      if (u && cached) {
        // Usuario y datos en cache → úsalo directamente
        setUser(u);
        setInvitadoData(JSON.parse(cached));
        setAuthChecked(true);
        return;
      }

      if (u && !cached) {
        try {
          const invitadosRef = collection(db, "invitados");
          const q = query(invitadosRef, where("email", "==", u.email?.toLowerCase()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            logoutAndRedirect();
            return;
          }

          const invitado = querySnapshot.docs[0].data();

          if (!invitado.zona_novios) {
            logoutAndRedirect();
            return;
          }

          localStorage.setItem("invitado", JSON.stringify(invitado));
          setUser(u);
          setInvitadoData(invitado);
          setAuthChecked(true);
        } catch (err) {
          logoutAndRedirect();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf9",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <img
          src="/favicons/rings.png"
          alt="Acceso"
          style={{
            width: "100px",
            height: "100px",
            marginBottom: "1.5rem",
            animation: "spin 1.5s linear infinite",
          }}
        />
        <p style={{ color: "#525252", fontSize: "1.125rem" }}>
          Cargando acceso personalizado...
        </p>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!user || !invitadoData) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 w-full max-w-xl relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={logoutAndRedirect}
            className="px-4 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm shadow hover:bg-stone-100 transition"
          >
            Cerrar sesión
          </button>
        </div>

        <h1 className="text-2xl font-bold text-stone-700 mb-2">
          Bienvenido, {invitadoData.nombre || user.displayName}
        </h1>
        <p className="text-stone-500 text-sm mb-4">
          Zona privada de gestión de la boda
        </p>

        <div className="mt-6 border border-dashed border-stone-300 rounded-xl p-4 text-stone-600 text-center">
          Aquí podrás gestionar invitados, el menú, la música y más... 🎉
        </div>
      </div>
    </div>
  );
}
