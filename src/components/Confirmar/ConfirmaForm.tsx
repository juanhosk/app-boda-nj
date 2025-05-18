import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ConfirmarInvitadosForm from "./ConfirmarInvitadosForm.tsx";
import AddInvitadosForm from "./AddInvitadosForm.tsx";

interface AcompananteEditable {
  id: string;
  nombre: string;
  apellido1: string;
  asiste: boolean | null;
  alergia: boolean;
  tipo_alergia: string;
}

export default function ConfirmarForm() {
  const [nombre, setNombre] = useState("");
  const [asiste, setAsiste] = useState<null | boolean>(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [alergia, setAlergia] = useState(false);
  const [tipoAlergia, setTipoAlergia] = useState("");
  const [acompanantesEditables, setAcompanantesEditables] = useState<AcompananteEditable[]>([]);
  const [numAcompanantes, setNumAcompanantes] = useState(0);
  const [hasMapAcompanantes, setHasMapAcompanantes] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTipo, setToastTipo] = useState<"error" | "ok">("ok");
  
  useEffect(() => {
    if (mensaje) {
      setToastVisible(true);
      const timeout = setTimeout(() => {
        setToastVisible(false);
        setMensaje("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  useEffect(() => {
    const stored = localStorage.getItem("invitado");
    if (!stored) return;

    const { code, nombre } = JSON.parse(stored);
    setNombre(nombre);
    setCode(code);

    const fetchData = async () => {
      const ref = doc(db, "invitados", code);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setAsiste(data.asiste ?? null);
        setAlergia(data.alergia ?? false);
        setTipoAlergia(data.tipo_alergia ?? "");
        setNumAcompanantes(data.num_acompanante ?? 0);

        if (data.acompanante) {
          setHasMapAcompanantes(true);
          const acompKeys = Object.keys(data.acompanante);
          const acompRefs = acompKeys.map((key) => data.acompanante[key]);
          const acompData = await Promise.all(
            acompRefs.map(async (ref: any) => {
              const snap = await getDoc(ref);
              if (!snap.exists()) return null;
              const data = snap.data() ?? {};
              return { id: ref.id, ...data };
            })
          );
          const acompanantesEnMap = acompData.filter(Boolean).length;
          setAcompanantesEditables(
            acompData.filter(Boolean).map((a: any) => ({
              id: a.id,
              nombre: a.nombre ?? "",
              apellido1: a.apellido1 ?? "",
              asiste: a.asiste ?? null,
              alergia: a.alergia ?? false,
              tipo_alergia: a.tipo_alergia ?? ""
            }))
          );
          setShowAddForm(acompanantesEnMap < (data.num_acompanante ?? 0));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleConfirm = async (respuesta: boolean) => {
    if (!code) return;
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, { asiste: respuesta });
    setAsiste(respuesta);
    setMensaje("¡Gracias por confirmar tu asistencia!");
  };

  const handleGuardarAlergia = async () => {
    if (!code) return;
  
    if (alergia && tipoAlergia.trim().length < 3) {
      setToastTipo("error");
      setMensaje("Por favor, indica el tipo de alergia con al menos 3 caracteres.");
      return;
    }
  
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, {
      alergia,
      tipo_alergia: alergia ? tipoAlergia : ""
    });
    setToastTipo("ok");
    setMensaje("¡Información adicional guardada!");
  };
  

  const pendientesPorAsignar = numAcompanantes - acompanantesEditables.length;

  if (loading) {
    return <p className="py-20 text-center text-stone-600">Cargando...</p>;
  }

  return (
    <section className="bg-neutral-50 py-20 px-4">
      <div className="site-container max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Confirmar asistencia</h2>
        <p className="text-stone-600 mb-6">Hola, {nombre}. ¿Podrás acompañarnos en nuestro día especial?</p>

        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => handleConfirm(true)}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${asiste === true ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            Sí, asistiré
          </button>
          <button
            onClick={() => handleConfirm(false)}
            disabled={asiste === true}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${asiste === false ? "bg-red-600" : asiste === true ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          >
            No podré asistir
          </button>
        </div>

        {asiste === true && (
          <div className="mt-8 text-left">
            <p className="mb-4 text-stone-700">¿Tienes alguna alergia alimentaria o régimen especial?</p>

            <div className="flex items-center gap-4 mb-6">
              <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alergia}
                  onChange={() => setAlergia(!alergia)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
              </label>
              <span className={`text-sm font-medium ${alergia ? "text-green-600" : "text-red-600"}`}>
                {alergia ? "Sí" : "No"}
              </span>
            </div>

            {alergia && (
              <div className="mb-6">
                <textarea
                  value={tipoAlergia}
                  onChange={(e) => setTipoAlergia(e.target.value)}
                  className={`w-full border px-4 py-2 rounded-md ${
                    tipoAlergia.trim().length < 3 ? "border-red-500" : "border-stone-300"
                  }`}
                  placeholder="Ej: Frutos secos, vegetariano, sin gluten..."
                />
              </div>
            )}


            <div className="text-center">
              <button
                onClick={handleGuardarAlergia}
                className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md"
              >
                Guardar información
              </button>
            </div>
          </div>
        )}

        {/* Render dinámico de acompañantes */}
        {numAcompanantes > 0 && (
          <>
            {/* Mostrar los ya asignados */}
            {acompanantesEditables.length > 0 && (
              <ConfirmarInvitadosForm
                acompanantes={acompanantesEditables}
                setAcompanantes={setAcompanantesEditables}
                setMensaje={setMensaje}
                setToastTipo={setToastTipo}
              />
            )}

            {/* Mostrar formulario de añadir si aún faltan */}
            {numAcompanantes > acompanantesEditables.length && (
              <AddInvitadosForm
                code={code}
                numAcompanantes={numAcompanantes}
                pendientesPorAsignar={pendientesPorAsignar}
                setNumAcompanantes={setNumAcompanantes}
                setMensaje={setMensaje}
              />
            )}
          </>
        )}

        {mensaje && <p className="text-primary-500 text-sm font-medium mt-4">{mensaje}</p>}

        {toastVisible && (
          <div
            className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300
              ${toastTipo === "error" ? "bg-red-600" : "bg-green-600"} text-white`}
          >
            <span className="text-xl">
              {toastTipo === "error" ? "⚠️" : "✅"}
            </span>
            <span className="text-sm font-medium">{mensaje}</span>
          </div>
)}

        <a href="/privado" className="mt-10 inline-block text-primary-500 hover:underline text-sm">← Volver a la zona privada</a>
      </div>
    </section>
  );
}
