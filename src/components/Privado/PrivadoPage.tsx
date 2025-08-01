import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc } from "firebase/firestore";

interface InvitadoData {
  nombre: string;
  apellido1: string;
  max_fotos_subir: number;
  num_fotos_subidas: number;
  num_acompanante: number;
  asiste: boolean;
}

export default function PrivadoPage() {
  const [invitado, setInvitado] = useState<InvitadoData | null>(null);
  const [fotosRestantes, setFotosRestantes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [numAcompanante, setNumAcompanante] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("invitado");

    if (!stored) {
      window.location.href = "/login";
      return;
    }

    const fetchActualizado = async () => {
      try {
        const { code } = JSON.parse(stored);
    
        const ref = doc(db, "invitados", code);
        const snap = await getDoc(ref);
    
        if (!snap.exists()) {
          console.warn("Invitado no encontrado, eliminando sesión");
          localStorage.removeItem("invitado");
          window.location.href = "/login";
          return;
        }
    
        const data = snap.data();
        const invitadoActualizado = {
          nombre: data.nombre ?? "",
          apellido1: data.apellido1 ?? "",
          max_fotos_subir: data.max_fotos_subir ?? 0,
          num_fotos_subidas: data.num_fotos_subidas ?? 0,
          num_acompanante: data.num_acompanante ?? 0,
          asiste: data.asiste ?? false,
          code: code,
        };
    
        setInvitado(invitadoActualizado);
        localStorage.setItem("invitado", JSON.stringify(invitadoActualizado));
    
        setFotosRestantes(
          (data.max_fotos_subir ?? 0) - (data.num_fotos_subidas ?? 0)
        );
        setNumAcompanante(data.num_acompanante ?? 0);
      } catch (error) {
        console.error("Error al obtener datos actualizados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActualizado();
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
            <button
              className="bg-primary-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-primary-600"
              onClick={() => {
                window.location.assign("/"); // client-side redirect
              }}
            >
              Información sobre la boda
            </button>
          {invitado.asiste ? (
            <a href="/revisar" className="bg-primary-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-primary-600">
              Revisar tu asistencia
            </a>
          ) : (
            <a href="/confirmar" className="bg-amber-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-amber-600">
              Confirmar asistencia
            </a>
          )}

          {numAcompanante > 0 && (
            <a href="/acompanante" className="bg-primary-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-primary-600">
              Acompañantes
            </a>
          )}

        {(() => {
          const ahora = new Date();
          const disponibleDesde = new Date("2026-05-15T00:00:00"); // Fecha de desbloqueo
          const esVisible = ahora >= disponibleDesde;

          if (esVisible) {
            return (
              <a
                href="/galeria"
                className="bg-white border rounded-xl py-4 px-6 text-xl text-stone-700 shadow hover:bg-stone-100 transition block"
              >
                <p className="mb-2">Galería de fotos</p>
                <p className="text-sm text-stone-500 mb-4">Ya puedes subir tus recuerdos</p>
                <p className="text-sm">
                  Te quedan <strong>{fotosRestantes}</strong> fotos por subir
                </p>
              </a>
            );
          } else {
            return (
              <div
                className="bg-white border rounded-xl py-4 px-6 text-xl text-stone-400 shadow opacity-50 cursor-not-allowed block"
              >
                <p className="mb-2">Galería de fotos</p>
                <p className="text-sm text-stone-500 mb-4">Disponible a partir del 15 de mayo de 2026</p>
                <p className="text-sm">Te quedan <strong>{fotosRestantes}</strong> fotos por subir</p>
              </div>
            );
          }
        })()}

        </div>
      </div>
    </section>
  );
}
