import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@js/firebase";

interface Acompanante {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  alergia: boolean;
  tipo_alergia: string;
  asiste: boolean;
}

export default function AcompanantesPage() {
  const [code, setCode] = useState("");
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);
  const [indexActivo, setIndexActivo] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [toastMensaje, setToastMensaje] = useState("");
  const [toastTipo, setToastTipo] = useState<"ok" | "error" | "">("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("invitado");
    if (!stored) return;
    const { code } = JSON.parse(stored);
    setCode(code);

    const fetchAcompanantes = async () => {
      const ref = doc(db, "invitados", code);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();

      if (data.acompanante) {
        const refs = Object.values(data.acompanante);
        const datos = await Promise.all(
          refs.map(async (ref: any) => {
            const s = await getDoc(ref);
            if (!s.exists()) return null;
            const d = s.data() as any;
            return {
              id: s.id,
              nombre: d.nombre ?? "",
              apellido1: d.apellido1 ?? "",
              apellido2: d.apellido2 ?? "",
              alergia: d.alergia ?? false,
              tipo_alergia: d.tipo_alergia ?? "",
              asiste: d.asiste !== false,
            };
          })
        );
        setAcompanantes(datos.filter((d): d is Acompanante => d !== null));
      }
    };

    fetchAcompanantes();
  }, []);

  useEffect(() => {
    if (toastMensaje) {
      const timeout = setTimeout(() => {
        setToastMensaje("");
        setToastTipo("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [toastMensaje]);

  const actualizarCampo = <K extends keyof Acompanante>(campo: K, valor: Acompanante[K]) => {
    const copia = [...acompanantes];
    copia[indexActivo][campo] = valor;
    setAcompanantes(copia);
  };

  const guardarCambios = async () => {
    const a = acompanantes[indexActivo];

    await updateDoc(doc(db, "invitados", a.id), {
      apellido2: a.apellido2,
      alergia: a.alergia,
      tipo_alergia: a.alergia ? a.tipo_alergia : "",
      asiste: a.asiste,
    });

    setToastTipo("ok");
    setToastMensaje("Cambios guardados correctamente ✨");

    if (a.asiste) {
      location.reload();
    }
  };

  const confirmarCancelacion = async () => {
    actualizarCampo("asiste", false);
    await guardarCambios();
    setShowModal(false);
  };

  const compartirCodigo = async (codigo: string) => {
    const url = `${window.location.origin}/code/?code=${codigo}`;
    const mensaje = `Puedes acceder a la web de Noelia y Juanjo desde este enlace:\n\n${url}\n\nTu código de acceso es:\n${codigo}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: mensaje });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(mensaje);
        alert("El mensaje ha sido copiado al portapapeles. Puedes compartirlo manualmente.");
      } catch {
        alert("Tu navegador no soporta compartir. Copia este mensaje:\n\n" + mensaje);
      }
    }
  };

  if (acompanantes.length === 0) return <p className="text-center py-20 text-stone-600">No tienes acompañantes asignados.</p>;

  const actual = acompanantes[indexActivo];
  const codigoInvitado = `${actual.id}`;

  return (
    <section className="bg-neutral-50 py-20 px-4">
      <div className="site-container max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-800 mb-6 text-center">Acompañantes</h2>

        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {acompanantes.map((a, idx) => (
            <button
              key={a.id}
              onClick={() => setIndexActivo(idx)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition ${
                idx === indexActivo
                  ? "bg-primary-500 text-white"
                  : "bg-stone-200 text-stone-700 hover:bg-stone-300"
              }`}
            >
              {a.nombre} {a.apellido1}
            </button>
          ))}
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
            <input
              type="text"
              value={actual.nombre}
              readOnly
              className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Apellido 1</label>
            <input
              type="text"
              value={actual.apellido1}
              readOnly
              className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50"
            />
          </div>

          {actual.asiste && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Apellido 2</label>
                <input
                  type="text"
                  value={actual.apellido2}
                  onChange={(e) => actualizarCampo("apellido2", e.target.value)}
                  className="w-full border border-stone-300 rounded-md px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Código de acceso a la web</label>
                <div className="relative">
                  <input
                    type="text"
                    value={codigoInvitado}
                    readOnly
                    className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => compartirCodigo(codigoInvitado)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                  >
                    <img src="/favicons/share.png" alt="Compartir" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">¿Tiene alguna alergia?</label>
                <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actual.alergia}
                    onChange={() => actualizarCampo("alergia", !actual.alergia)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                </label>
                <span className={`text-sm font-medium ${actual.alergia ? "text-green-600" : "text-red-600"}`}>
                  {actual.alergia ? "Sí" : "No"}
                </span>
              </div>

              {actual.alergia && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">¿Cuál?</label>
                  <input
                    type="text"
                    value={actual.tipo_alergia}
                    onChange={(e) => actualizarCampo("tipo_alergia", e.target.value)}
                    className="w-full border border-stone-300 rounded-md px-4 py-2"
                  />
                </div>
              )}

              <div className="bg-red-100 border border-red-400 p-4 rounded-md">
                <p className="text-red-700 text-sm mb-2 font-medium">¿Quieres cancelar la asistencia de tu invitado?</p>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
                >
                  Cancelar asistencia
                </button>
              </div>
            </>
          )}

          {!actual.asiste && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">¿Desea asistir?</label>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md"
              >
                Confirmar asistencia
              </button>
            </div>
          )}


          <div className="text-center mt-6">
            <button
              type="button"
              onClick={guardarCambios}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md"
            >
              Guardar cambios
            </button>
          </div>

          {mensaje && <p className="text-primary-500 text-sm text-center mt-4">{mensaje}</p>}
        </form>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm w-full">
              <p className="text-red-700 text-base font-semibold mb-2">⚠️ Se enviará un aviso a los novios notificando esta acción.</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={confirmarCancelacion}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Confirmar cancelación
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-xl"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm w-full">
              <p className="text-stone-700 text-base font-semibold mb-2">
                 ¿Deseas confirmar la asistencia de este acompañante?
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    actualizarCampo("asiste", true);
                    setShowConfirmModal(false);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Confirmar asistencia
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-xl"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
