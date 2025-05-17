import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc } from "firebase/firestore";

interface InvitadoData {
  nombre: string;
  apellido1: string;
  max_fotos_subir: number;
  num_fotos_subidas: number;
  asiste: boolean;
}

export default function PrivadoPage() {
  const [invitado, setInvitado] = useState<InvitadoData | null>(null);
  const [fotosRestantes, setFotosRestantes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("invitado");
    if (!stored) {
      window.location.href = "/login";
    }
    if (!stored) return;
    const { code } = JSON.parse(stored);
    const fetchData = async () => {
      const ref = doc(db, "invitados", code);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as InvitadoData;
        setInvitado(data);
        setFotosRestantes(data.max_fotos_subir - (data.num_fotos_subidas || 0));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <p className="text-stone-600">Cargando...</p>
      </section>
    );
  }

  if (!invitado) {
    return (
      <section className="py-20 text-center">
        <p className="text-stone-600 mb-4">No tienes acceso autorizado.</p>
        <a href="/login" className="text-primary-500 underline">Volver al login</a>
      </section>
    );
  }

  return (
    <section className="bg-neutral-50 py-20 px-4">
      <div className="site-container max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">Bienvenido/a, {invitado.nombre} 👋</h1>
        <p className="text-lg text-stone-600 mb-6">
          Esta es tu zona privada para nuestra boda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {invitado.asiste ? (
            <a href="/revisar" className="bg-amber-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-amber-600">
              Revisar tu asistencia
            </a>
          ) : (
            <a href="/confirmar" className="bg-primary-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-primary-600">
              Confirmar asistencia
            </a>
          )}

          <div className="bg-white border rounded-xl py-4 px-6 text-xl text-stone-700 shadow">
            <p className="mb-2">Subida de fotos</p>
            <p className="text-sm text-stone-500 mb-4">Disponible a partir del día de la boda</p>
            <p className="text-sm">Te quedan <strong>{fotosRestantes}</strong> fotos por subir</p>
          </div>
        </div>
      </div>
    </section>
  );
}
