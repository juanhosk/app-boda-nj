import { useEffect, useState } from "react";
import { auth } from "@js/firebase";
import LogoutButton from "@components/Auth/LogoutIsland";
import {
  onAuthStateChanged,
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

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;

      const cached = localStorage.getItem("invitado");

      if (u && cached) {
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

          if (!querySnapshot.empty) {
            const invitado = querySnapshot.docs[0].data();

            if (invitado.zona_novios) {
              localStorage.setItem("invitado", JSON.stringify(invitado));
              setUser(u);
              setInvitadoData(invitado);
              setAuthChecked(true);
              return;
            }
          }

          // Si no cumple los requisitos, redirige
          window.location.href = "/loginNovios";
        } catch {
          window.location.href = "/loginNovios";
        }
      }

      if (!u) {
        setAuthChecked(true);
        if (!cached) {
          window.location.href = "/loginNovios";
        } else {
          setInvitadoData(JSON.parse(cached));
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (!authChecked || !user || !invitadoData) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 w-full max-w-xl relative">
        <h1 className="text-2xl font-bold text-stone-700 mb-2">
          Bienvenido, {invitadoData.nombre || user.displayName}
        </h1>
        <p className="text-stone-500 text-sm mb-4">
          Zona privada de gestión de la boda
        </p>

        <div className="mt-6 border border-dashed border-stone-300 rounded-xl p-4 text-stone-600 text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/infoInvitados"
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm shadow hover:bg-primary-600 transition"
            >
              Ver invitados
            </a>
            <a
              href="/addInvitados"
              className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm shadow hover:bg-primary-600 transition"
            >
              Añadir invitados
            </a>
            {/* Aquí puedes meter más botones si quieres */}
          </div>
        </div>


        {/* Logout centrado al final */}
        <div className="mt-8 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
